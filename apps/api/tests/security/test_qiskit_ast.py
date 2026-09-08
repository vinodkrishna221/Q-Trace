"""QA-4: Malicious AST corpus for the safe Qiskit parser.

Tests that the parser rejects every dangerous construct and accepts only the
safe subset defined in circuit-simulation.md v1 and quantum-runtime.md.

Key rule (quantum-runtime.md):
  "Parse submitted Qiskit with Python `ast` and an allowlist; NEVER exec,
   evaluate expressions, import arbitrary modules, access files or call
   the network."

These are cross-track acceptance tests — they consume the parser but never
modify it.
"""

import pytest

from app.services.quantum.parser import ParseError, parse_qiskit_code


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _assert_rejected(code: str, expected_code: str | None = None) -> ParseError:
    """Assert that parse_qiskit_code raises ParseError, return the error."""
    with pytest.raises(ParseError) as exc_info:
        parse_qiskit_code(code)
    err = exc_info.value
    if expected_code is not None:
        assert err.code == expected_code, (
            f"Expected error code '{expected_code}', got '{err.code}' for code:\n{code}"
        )
    return err


def _assert_accepted(code: str):
    """Assert that parse_qiskit_code succeeds and returns a CircuitModel."""
    from app.models.circuit import CircuitModel
    result = parse_qiskit_code(code)
    assert result is not None
    assert hasattr(result, "operations")
    return result


SAFE_BELL = (
    "from qiskit import QuantumCircuit\n"
    "qc = QuantumCircuit(2, 2)\n"
    "qc.h(0)\n"
    "qc.cx(0, 1)\n"
    "qc.measure([0, 1], [0, 1])\n"
)


# ---------------------------------------------------------------------------
# Baseline — safe code accepted
# ---------------------------------------------------------------------------

def test_safe_bell_code_accepted():
    """The canonical Bell code from contract examples is accepted."""
    result = _assert_accepted(SAFE_BELL)
    from app.models.circuit import GateName
    gate_names = [op.gate for op in result.operations]
    assert GateName.H in gate_names
    assert GateName.CNOT in gate_names


def test_safe_all_supported_gates():
    """All supported gates in sequence are accepted."""
    code = (
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(3, 3)\n"
        "qc.h(0)\n"
        "qc.x(1)\n"
        "qc.y(2)\n"
        "qc.z(0)\n"
        "qc.cx(0, 1)\n"
        "qc.measure([0, 1, 2], [0, 1, 2])\n"
    )
    _assert_accepted(code)


# ---------------------------------------------------------------------------
# exec / eval — most critical
# ---------------------------------------------------------------------------

def test_rejects_exec_call():
    """exec() must be rejected as UNSAFE_CODE."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "exec('import os')\n",
        expected_code="UNSAFE_CODE",
    )


def test_rejects_eval_call():
    """eval() must be rejected as UNSAFE_CODE."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "eval('1+1')\n",
        expected_code="UNSAFE_CODE",
    )


def test_rejects_compile_call():
    """compile() must be rejected."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "compile('print(1)', '', 'exec')\n",
        expected_code="UNSAFE_CODE",
    )


# ---------------------------------------------------------------------------
# Arbitrary imports
# ---------------------------------------------------------------------------

def test_rejects_import_os():
    """import os must be rejected as UNSAFE_CODE."""
    _assert_rejected(
        "import os\n"
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "qc.h(0)\n",
        expected_code="UNSAFE_CODE",
    )


def test_rejects_import_sys():
    """import sys must be rejected."""
    _assert_rejected(
        "import sys\n"
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n",
        expected_code="UNSAFE_CODE",
    )


def test_rejects_dunder_import():
    """__import__() call must be rejected as UNSAFE_CODE."""
    # __import__ is a forbidden name, will raise UNSAFE_CODE
    err = _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "__import__('os').system('ls')\n",
    )
    assert err.code == "UNSAFE_CODE"


def test_rejects_from_os_import():
    """from os import path must be rejected."""
    _assert_rejected(
        "from os import path\n"
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n",
    )


def test_rejects_from_qiskit_non_quantumcircuit():
    """from qiskit import QuantumRegister is not the allowed import."""
    _assert_rejected(
        "from qiskit import QuantumRegister\n"
        "qr = QuantumRegister(2)\n",
    )


# ---------------------------------------------------------------------------
# Loops and control flow
# ---------------------------------------------------------------------------

def test_rejects_for_loop():
    """for loops must be rejected."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "for i in range(2):\n"
        "    qc.h(i)\n",
        expected_code="UNSAFE_CODE",
    )


def test_rejects_while_loop():
    """while loops must be rejected."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "i = 0\n"
        "while i < 2:\n"
        "    i += 1\n",
        expected_code="UNSAFE_CODE",
    )


# ---------------------------------------------------------------------------
# Function definitions
# ---------------------------------------------------------------------------

def test_rejects_function_def():
    """def functions must be rejected."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "def make_bell():\n"
        "    qc = QuantumCircuit(2, 2)\n"
        "    qc.h(0)\n"
        "    return qc\n"
        "qc = make_bell()\n",
        expected_code="UNSAFE_CODE",
    )


def test_rejects_lambda():
    """lambda expressions must be rejected."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "f = lambda x: x\n",
        expected_code="UNSAFE_CODE",
    )


# ---------------------------------------------------------------------------
# File / network access patterns
# ---------------------------------------------------------------------------

def test_rejects_open_file():
    """open() must be rejected as UNSAFE_CODE."""
    # open is a forbidden name; tested with a valid 2-qubit circuit
    err = _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "open('/etc/passwd').read()\n",
    )
    assert err.code == "UNSAFE_CODE"


def test_rejects_getattr_call():
    """getattr() must be rejected as UNSAFE_CODE."""
    err = _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "getattr(qc, 'h')(0)\n",
    )
    assert err.code == "UNSAFE_CODE"


# ---------------------------------------------------------------------------
# Unsupported gates
# ---------------------------------------------------------------------------

def test_rejects_unsupported_gate_rx():
    """RX gate is outside the prototype subset and must be rejected."""
    err = _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "qc.rx(3.14, 0)\n",
    )
    assert err.code == "UNSUPPORTED_GATE"


def test_rejects_unsupported_gate_rz():
    """RZ gate must be rejected."""
    err = _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "qc.rz(1.57, 0)\n",
    )
    assert err.code == "UNSUPPORTED_GATE"


def test_rejects_unsupported_gate_t():
    """T gate must be rejected."""
    err = _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "qc.t(0)\n",
    )
    assert err.code == "UNSUPPORTED_GATE"


# ---------------------------------------------------------------------------
# Circuit limit violations
# ---------------------------------------------------------------------------

def test_rejects_too_many_qubits():
    """Circuits with more than 5 qubits exceed the prototype limit."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(6, 6)\n"
        "qc.h(0)\n",
        expected_code="CIRCUIT_LIMIT_EXCEEDED",
    )


# ---------------------------------------------------------------------------
# Obfuscation attempts
# ---------------------------------------------------------------------------

def test_rejects_setattr_call():
    """setattr() must be rejected as UNSAFE_CODE."""
    err = _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "setattr(qc, 'name', 'evil')\n",
    )
    assert err.code == "UNSAFE_CODE"


def test_rejects_class_definition():
    """class definitions must be rejected."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "class Evil(QuantumCircuit): pass\n",
        expected_code="UNSAFE_CODE",
    )


def test_rejects_list_comprehension():
    """List comprehensions must be rejected (potential loop smuggling)."""
    _assert_rejected(
        "from qiskit import QuantumCircuit\n"
        "qc = QuantumCircuit(2, 2)\n"
        "[qc.h(i) for i in range(2)]\n",
        expected_code="UNSAFE_CODE",
    )


# ---------------------------------------------------------------------------
# Edge: deliberately reversed mapper is caught at the normalizer level
# ---------------------------------------------------------------------------

def test_reversed_mapper_detected_via_probability():
    """Acceptance-level check: a deliberately reversed mapper produces
    the wrong basis key ('01' instead of '10') for H on qubit-0.
    This test acts as a regression guard for normalizer.py correctness.
    """
    from app.services.quantum.normalizer import qiskit_index_to_contract_label

    # H on qubit-0, 2-qubit system:
    # Qiskit statevector index 1 = qubit-0 is |1>, qubit-1 is |0>
    # Contract label must be "10" (qubit-0 leftmost = MSB)
    correct = qiskit_index_to_contract_label(1, 2)
    assert correct == "10", (
        f"Reversed-mapper guard FAIL: qiskit_index_to_contract_label(1, 2) returned "
        f"'{correct}', expected '10'. A reversed mapper would return '01'."
    )
