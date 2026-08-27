"""Basis-order normalization for Qiskit → contract label mapping.

Qiskit Aer statevectors use LITTLE-ENDIAN wire order:
  - The rightmost character of the basis string = qubit 0 (LSB)
  - e.g., for 2 qubits, Qiskit index 1 (binary "01") means q0=1, q1=0

The contract uses BIG-ENDIAN labels (qubit 0 = MSB / leftmost character):
  - basis "01" in contract means q0=0, q1=1

This normalization module provides a single tested function to convert
a Qiskit statevector (indexed by integer) to a contract-keyed dict.

Rule from quantum-runtime.md:
  "Normalize Qiskit and PennyLane wire/basis order at the adapter boundary
   with one tested mapping function."

No quantum SDK import here — normalization is pure Python arithmetic.
"""

from __future__ import annotations


def qiskit_index_to_contract_label(qiskit_index: int, n_qubits: int) -> str:
    """Convert a Qiskit statevector index to a contract basis label.

    Qiskit statevector index i:
      binary representation with n_qubits bits, LSB = qubit 0.

    Contract label:
      The same binary string but REVERSED so qubit 0 is the leftmost char.

    Example (2 qubits):
      Qiskit index 1 → binary "01" → reversed "10" → contract label "10"
      Qiskit index 2 → binary "10" → reversed "01" → contract label "01"

    Args:
        qiskit_index: Integer index from Qiskit statevector (0 to 2^n_qubits - 1)
        n_qubits: Number of qubits in the circuit

    Returns:
        Contract basis label string (big-endian, qubit 0 leftmost)
    """
    # Format as zero-padded binary then reverse
    qiskit_bits = format(qiskit_index, f"0{n_qubits}b")
    contract_label = qiskit_bits[::-1]
    return contract_label


def build_normalized_amplitude_map(
    statevector: list[complex],
    n_qubits: int,
    tol: float = 1e-10,
) -> dict[str, dict[str, float]]:
    """Build contract-keyed {re, im} amplitude map from a Qiskit statevector.

    Only includes basis states with |amplitude|^2 > tol (omits near-zero states).

    Args:
        statevector: Complex amplitude list, length 2^n_qubits (Qiskit order)
        n_qubits: Number of qubits
        tol: Threshold below which amplitudes are considered zero

    Returns:
        Dict mapping contract basis labels → {"re": float, "im": float}
    """
    result: dict[str, dict[str, float]] = {}
    for idx, amp in enumerate(statevector):
        prob = abs(amp) ** 2
        if prob > tol:
            label = qiskit_index_to_contract_label(idx, n_qubits)
            result[label] = {"re": float(amp.real), "im": float(amp.imag)}
    return result


def build_normalized_probability_map(
    statevector: list[complex],
    n_qubits: int,
    tol: float = 1e-10,
) -> dict[str, float]:
    """Build contract-keyed probability map from a Qiskit statevector.

    Args:
        statevector: Complex amplitude list, length 2^n_qubits (Qiskit order)
        n_qubits: Number of qubits
        tol: Threshold below which probabilities are omitted

    Returns:
        Dict mapping contract basis labels → probability float
    """
    result: dict[str, float] = {}
    for idx, amp in enumerate(statevector):
        prob = abs(amp) ** 2
        if prob > tol:
            label = qiskit_index_to_contract_label(idx, n_qubits)
            result[label] = float(prob)
    return result


def normalize_counts(
    raw_counts: dict[str, int],
    n_qubits: int,
) -> dict[str, int]:
    """Normalize Qiskit measurement counts dict to contract basis labels.

    Qiskit counts keys are binary strings in little-endian order separated by
    spaces for registers (e.g., "01 10" or "0 1"). This function handles the
    single-register case and maps to big-endian contract labels.

    Args:
        raw_counts: Qiskit counts dict {basis_string: count}
        n_qubits: Number of qubits

    Returns:
        Contract-keyed counts dict
    """
    result: dict[str, int] = {}
    for key, count in raw_counts.items():
        # Qiskit may include spaces for multi-register; strip and join
        bits = key.replace(" ", "")
        # Qiskit count strings are already reversed relative to our convention
        # (Qiskit: rightmost = qubit 0; contract: leftmost = qubit 0)
        # Pad to n_qubits if needed, then reverse
        bits = bits.zfill(n_qubits)
        contract_label = bits[::-1]
        result[contract_label] = result.get(contract_label, 0) + count
    return result
