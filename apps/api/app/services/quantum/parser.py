"""Safe Qiskit AST parser — SIM-5.

Parses but NEVER executes submitted Python code.

Rules from quantum-runtime.md + circuit-simulation contract v1:
  - Use Python `ast` and an allowlist. NEVER exec/eval.
  - Allowlisted imports: `from qiskit import QuantumCircuit` only.
  - Allowlisted calls: QuantumCircuit(n, m) constructor + qc.<gate>(args).
  - Supported gates: H, X, Y, Z, CNOT (qc.cx), MEASURE (qc.measure).
  - Reject: loops, functions, attributes beyond qc.<gate>, file/network access,
    dynamic values, expressions, arbitrary imports, exec/eval.
  - One QuantumCircuit symbol (no re-assignment, no aliases beyond `qc`).
  - Code length: 1–8000 chars; modelVersion must be 1.

Output: a validated CircuitModel (source="SUPPORTED_QISKIT") or raises a
structured ParseError that the router converts to 422.
"""

from __future__ import annotations

import ast
import uuid
from dataclasses import dataclass, field
from typing import Final

from app.models.circuit import CircuitModel, GateName, Operation

# ---------------------------------------------------------------------------
# Error type
# ---------------------------------------------------------------------------

@dataclass
class ParseError(Exception):
    """Structured parse error for 422 responses."""
    code: str        # e.g. "UNSAFE_CODE" | "UNSUPPORTED_GATE" | "PARSE_ERROR"
    message: str
    details: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Allowlists
# ---------------------------------------------------------------------------

# Only this import statement is permitted
_ALLOWED_IMPORT: Final = ("qiskit", {"QuantumCircuit"})

# Map from Qiskit method name → GateName enum
_QISKIT_METHOD_TO_GATE: Final[dict[str, GateName]] = {
    "h":       GateName.H,
    "x":       GateName.X,
    "y":       GateName.Y,
    "z":       GateName.Z,
    "cx":      GateName.CNOT,
    "measure": GateName.MEASURE,
}

# AST node types that are unconditionally forbidden
_FORBIDDEN_NODE_TYPES: Final = (
    ast.For,
    ast.While,
    ast.AsyncFor,
    ast.FunctionDef,
    ast.AsyncFunctionDef,
    ast.ClassDef,
    ast.With,
    ast.AsyncWith,
    ast.Try,
    ast.TryStar,    # Python 3.11+; graceful if absent
    ast.Import,     # bare import — we handle ImportFrom separately
    ast.Global,
    ast.Nonlocal,
    ast.Delete,
    ast.Raise,
    ast.Assert,
    ast.Lambda,
    ast.ListComp,
    ast.SetComp,
    ast.DictComp,
    ast.GeneratorExp,
    ast.Yield,
    ast.YieldFrom,
    ast.Await,
    ast.IfExp,      # ternary expressions
)

# Dangerous builtins / names
_FORBIDDEN_NAMES: Final = frozenset({
    "exec", "eval", "compile", "__import__", "open", "input",
    "print",  # no side-effects needed
    "breakpoint", "exit", "quit",
    "globals", "locals", "vars", "dir", "getattr", "setattr", "delattr",
})


# ---------------------------------------------------------------------------
# Visitor
# ---------------------------------------------------------------------------

class _SafeQiskitVisitor(ast.NodeVisitor):
    """Walks the AST and extracts operations or raises ParseError."""

    def __init__(self) -> None:
        self._qc_var: str | None = None        # name of the QuantumCircuit variable
        self._qubit_count: int | None = None
        self._classical_count: int | None = 0
        self._operations: list[Operation] = []
        self._column_counter: int = 0
        self._op_id_counter: int = 1

    # ------------------------------------------------------------------
    # Forbidden node handlers
    # ------------------------------------------------------------------

    def _check_forbidden(self, node: ast.AST) -> None:
        # Filter out TryStar gracefully (Python < 3.11 has no TryStar)
        try:
            forbidden = _FORBIDDEN_NODE_TYPES
        except Exception:  # pragma: no cover
            forbidden = tuple(t for t in _FORBIDDEN_NODE_TYPES if t is not None)
        if isinstance(node, forbidden):
            raise ParseError(
                code="UNSAFE_CODE",
                message=f"Forbidden AST node type: {type(node).__name__}.",
            )

    def generic_visit(self, node: ast.AST) -> None:
        self._check_forbidden(node)
        super().generic_visit(node)

    # ------------------------------------------------------------------
    # Import handling
    # ------------------------------------------------------------------

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        module = node.module or ""
        names = {alias.name for alias in node.names}
        if module != "qiskit" or not names.issubset({"QuantumCircuit"}):
            raise ParseError(
                code="UNSAFE_CODE",
                message=(
                    f"Only 'from qiskit import QuantumCircuit' is allowed. "
                    f"Got: from {module} import {', '.join(sorted(names))}."
                ),
            )

    # ------------------------------------------------------------------
    # Name usage
    # ------------------------------------------------------------------

    def visit_Name(self, node: ast.Name) -> None:
        if isinstance(node.ctx, ast.Load) and node.id in _FORBIDDEN_NAMES:
            raise ParseError(
                code="UNSAFE_CODE",
                message=f"Use of forbidden name '{node.id}'.",
            )

    # ------------------------------------------------------------------
    # Assignment — only QuantumCircuit() constructor allowed
    # ------------------------------------------------------------------

    def visit_Assign(self, node: ast.Assign) -> None:
        # Must be a single target: `qc = QuantumCircuit(n, m)`
        if len(node.targets) != 1:
            raise ParseError(
                code="UNSAFE_CODE",
                message="Only a single assignment target is allowed.",
            )
        target = node.targets[0]
        if not isinstance(target, ast.Name):
            raise ParseError(
                code="UNSAFE_CODE",
                message="Assignment target must be a simple variable name.",
            )

        # Prevent re-assignment of the QuantumCircuit variable
        if self._qc_var is not None and target.id == self._qc_var:
            raise ParseError(
                code="UNSAFE_CODE",
                message=f"Re-assignment of QuantumCircuit variable '{self._qc_var}' is not allowed.",
            )

        # RHS must be Call to QuantumCircuit
        value = node.value
        if not isinstance(value, ast.Call):
            raise ParseError(
                code="UNSAFE_CODE",
                message="Only QuantumCircuit(...) constructor assignments are allowed.",
            )
        func = value.func
        if not (isinstance(func, ast.Name) and func.id == "QuantumCircuit"):
            raise ParseError(
                code="UNSAFE_CODE",
                message="Only QuantumCircuit(...) constructor calls are allowed in assignments.",
            )

        # QuantumCircuit must already have been imported
        # Args: (n_qubits,) or (n_qubits, n_classical)
        args = value.args
        if len(args) not in (1, 2) or value.keywords:
            raise ParseError(
                code="PARSE_ERROR",
                message="QuantumCircuit must be called as QuantumCircuit(n) or QuantumCircuit(n, m).",
            )
        n_qubits = self._extract_positive_int(args[0], "qubitCount")
        n_classical = self._extract_non_negative_int(args[1], "classicalBitCount") if len(args) == 2 else 0

        # Prototype limits
        if not (2 <= n_qubits <= 5):
            raise ParseError(
                code="CIRCUIT_LIMIT_EXCEEDED",
                message=f"qubitCount must be between 2 and 5, got {n_qubits}.",
                details={"qubitCount": n_qubits},
            )

        if self._qc_var is not None:
            raise ParseError(
                code="UNSAFE_CODE",
                message="Only one QuantumCircuit may be defined.",
            )

        self._qc_var = target.id
        self._qubit_count = n_qubits
        self._classical_count = n_classical

    # ------------------------------------------------------------------
    # Expression statements — must be qc.<gate>(args) calls
    # ------------------------------------------------------------------

    def visit_Expr(self, node: ast.Expr) -> None:
        value = node.value
        if not isinstance(value, ast.Call):
            raise ParseError(
                code="UNSAFE_CODE",
                message="Only method calls on the QuantumCircuit variable are allowed as statements.",
            )
        self._handle_gate_call(value)

    def _handle_gate_call(self, call: ast.Call) -> None:
        func = call.func
        if not isinstance(func, ast.Attribute):
            raise ParseError(
                code="UNSAFE_CODE",
                message="Only attribute calls (qc.gate(...)) are allowed.",
            )
        # Must call on the known QuantumCircuit variable
        if not isinstance(func.value, ast.Name):
            raise ParseError(
                code="UNSAFE_CODE",
                message="Gate calls must be directly on the QuantumCircuit variable.",
            )
        if self._qc_var is None:
            raise ParseError(
                code="PARSE_ERROR",
                message="Gate call appears before QuantumCircuit assignment.",
            )
        if func.value.id != self._qc_var:
            raise ParseError(
                code="UNSAFE_CODE",
                message=(
                    f"Gate call on unknown variable '{func.value.id}'. "
                    f"Only '{self._qc_var}' is allowed."
                ),
            )
        method = func.attr
        if method not in _QISKIT_METHOD_TO_GATE:
            raise ParseError(
                code="UNSUPPORTED_GATE",
                message=f"Method '{method}' is not in the supported Qiskit subset.",
                details={"method": method, "allowedMethods": list(_QISKIT_METHOD_TO_GATE.keys())},
            )
        if call.keywords:
            raise ParseError(
                code="UNSAFE_CODE",
                message="Keyword arguments are not allowed in gate calls.",
            )
        gate = _QISKIT_METHOD_TO_GATE[method]
        self._emit_operation(gate, call.args)

    def _emit_operation(self, gate: GateName, raw_args: list[ast.expr]) -> None:
        n_qubits = self._qubit_count
        if n_qubits is None:
            raise ParseError(
                code="PARSE_ERROR",
                message="Gate call appears before QuantumCircuit assignment.",
            )
        op_id = f"op_{self._op_id_counter}"
        self._op_id_counter += 1
        col = self._column_counter
        self._column_counter += 1

        if gate == GateName.CNOT:
            # qc.cx(control, target)
            if len(raw_args) != 2:
                raise ParseError(
                    code="PARSE_ERROR",
                    message=f"cx() requires exactly 2 args (control, target), got {len(raw_args)}.",
                )
            control = self._extract_qubit_index(raw_args[0], "cx control", n_qubits)
            target = self._extract_qubit_index(raw_args[1], "cx target", n_qubits)
            if control == target:
                raise ParseError(
                    code="PARSE_ERROR",
                    message="cx(): control and target must be different qubits.",
                )
            self._operations.append(Operation(
                opId=op_id,
                gate=gate,
                targets=[target],
                controls=[control],
                classicalTargets=[],
                column=col,
            ))

        elif gate == GateName.MEASURE:
            # qc.measure(qubit_or_list, classical_or_list)
            if len(raw_args) != 2:
                raise ParseError(
                    code="PARSE_ERROR",
                    message=f"measure() requires exactly 2 args, got {len(raw_args)}.",
                )
            qubits = self._extract_int_or_list(raw_args[0], "measure qubit", n_qubits)
            cbits = self._extract_classical_or_list(raw_args[1], "measure classical")
            if len(qubits) != len(cbits):
                raise ParseError(
                    code="PARSE_ERROR",
                    message="measure(): qubit and classical bit counts must match.",
                )
            self._operations.append(Operation(
                opId=op_id,
                gate=gate,
                targets=qubits,
                controls=[],
                classicalTargets=cbits,
                column=col,
            ))

        else:
            # Single-qubit gate: qc.h(qubit) etc.
            if len(raw_args) != 1:
                raise ParseError(
                    code="PARSE_ERROR",
                    message=f"{gate.value}() requires exactly 1 arg, got {len(raw_args)}.",
                )
            qubit = self._extract_qubit_index(raw_args[0], gate.value, n_qubits)
            self._operations.append(Operation(
                opId=op_id,
                gate=gate,
                targets=[qubit],
                controls=[],
                classicalTargets=[],
                column=col,
            ))

    # ------------------------------------------------------------------
    # Argument extraction helpers — only integer literals allowed
    # ------------------------------------------------------------------

    def _extract_positive_int(self, node: ast.expr, context: str) -> int:
        v = self._extract_non_negative_int(node, context)
        if v <= 0:
            raise ParseError(
                code="PARSE_ERROR",
                message=f"{context} must be a positive integer literal, got {v}.",
            )
        return v

    def _extract_non_negative_int(self, node: ast.expr, context: str) -> int:
        if not (isinstance(node, ast.Constant) and isinstance(node.value, int)):
            raise ParseError(
                code="UNSAFE_CODE",
                message=f"{context} must be an integer literal (no expressions or variables).",
            )
        if node.value < 0:
            raise ParseError(
                code="PARSE_ERROR",
                message=f"{context} must be non-negative, got {node.value}.",
            )
        return node.value

    def _extract_qubit_index(self, node: ast.expr, context: str, n_qubits: int) -> int:
        idx = self._extract_non_negative_int(node, context)
        if idx >= n_qubits:
            raise ParseError(
                code="PARSE_ERROR",
                message=f"{context}: qubit index {idx} >= qubitCount {n_qubits}.",
                details={"qubitIndex": idx, "qubitCount": n_qubits},
            )
        return idx

    def _extract_int_or_list(self, node: ast.expr, context: str, n_qubits: int) -> list[int]:
        """Extract a single int or a list of ints (only Constant elements)."""
        if isinstance(node, ast.Constant) and isinstance(node.value, int):
            return [self._extract_qubit_index(node, context, n_qubits)]
        if isinstance(node, ast.List):
            result = []
            for elt in node.elts:
                if not (isinstance(elt, ast.Constant) and isinstance(elt.value, int)):
                    raise ParseError(
                        code="UNSAFE_CODE",
                        message=f"{context}: list elements must be integer literals.",
                    )
                result.append(self._extract_qubit_index(elt, context, n_qubits))
            return result
        raise ParseError(
            code="UNSAFE_CODE",
            message=f"{context}: must be an integer literal or list of integer literals.",
        )

    def _extract_classical_or_list(self, node: ast.expr, context: str) -> list[int]:
        n_classical = self._classical_count or 0
        if isinstance(node, ast.Constant) and isinstance(node.value, int):
            idx = node.value
            if idx < 0 or (n_classical > 0 and idx >= n_classical):
                raise ParseError(
                    code="PARSE_ERROR",
                    message=f"{context}: classical bit index {idx} out of range.",
                )
            return [idx]
        if isinstance(node, ast.List):
            result = []
            for elt in node.elts:
                if not (isinstance(elt, ast.Constant) and isinstance(elt.value, int)):
                    raise ParseError(
                        code="UNSAFE_CODE",
                        message=f"{context}: list elements must be integer literals.",
                    )
                idx = elt.value
                if idx < 0 or (n_classical > 0 and idx >= n_classical):
                    raise ParseError(
                        code="PARSE_ERROR",
                        message=f"{context}: classical bit index {idx} out of range.",
                    )
                result.append(idx)
            return result
        raise ParseError(
            code="UNSAFE_CODE",
            message=f"{context}: must be an integer literal or list of integer literals.",
        )

    # ------------------------------------------------------------------
    # Result builder
    # ------------------------------------------------------------------

    def build_circuit_model(self) -> CircuitModel:
        if self._qc_var is None:
            raise ParseError(
                code="PARSE_ERROR",
                message="No QuantumCircuit assignment found in the submitted code.",
            )
        if self._qubit_count is None:
            raise ParseError(
                code="PARSE_ERROR",
                message="QuantumCircuit qubit count could not be determined.",
            )
        if len(self._operations) > 20:
            raise ParseError(
                code="CIRCUIT_LIMIT_EXCEEDED",
                message=f"Circuit has {len(self._operations)} operations; maximum is 20.",
                details={"operationCount": len(self._operations)},
            )
        return CircuitModel(
            id=f"cm_parsed_{uuid.uuid4().hex[:12]}",
            name="Parsed Qiskit Circuit",
            qubitCount=self._qubit_count,
            classicalBitCount=self._classical_count or 0,
            operations=self._operations,
            source="SUPPORTED_QISKIT",
            modelVersion=1,
        )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

_MAX_CODE_LENGTH: Final = 8000


def parse_qiskit_code(code: str) -> CircuitModel:
    """Parse submitted Qiskit Python code into a validated CircuitModel.

    Never executes the code. Uses Python `ast` module with an allowlist.

    Args:
        code: Submitted Python source string (1–8000 chars).

    Returns:
        CircuitModel with source="SUPPORTED_QISKIT".

    Raises:
        ParseError: For any unsafe, unsupported, or invalid code.
    """
    if not code or len(code) > _MAX_CODE_LENGTH:
        raise ParseError(
            code="PARSE_ERROR",
            message=(
                f"Code must be between 1 and {_MAX_CODE_LENGTH} characters. "
                f"Got {len(code)} characters."
            ),
        )

    # Parse into AST — catches syntax errors
    try:
        tree = ast.parse(code, mode="exec")
    except SyntaxError as exc:
        raise ParseError(
            code="PARSE_ERROR",
            message=f"Syntax error in submitted code: {exc}.",
            details={"line": exc.lineno, "offset": exc.offset},
        ) from exc

    # Walk AST with the visitor
    visitor = _SafeQiskitVisitor()
    try:
        visitor.visit(tree)
    except ParseError:
        raise
    except Exception as exc:  # pragma: no cover
        raise ParseError(
            code="PARSE_ERROR",
            message=f"Unexpected error during AST analysis: {exc}.",
        ) from exc

    return visitor.build_circuit_model()
