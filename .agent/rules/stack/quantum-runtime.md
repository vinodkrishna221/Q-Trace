# Stack Pack — Quantum Runtime (load on simulation, AI-pedagogy and QA tracks)

Compatibility baseline: Python 3.12 · Qiskit 2.3 line · Qiskit Aer 0.17 line · PennyLane 0.45 line. Commit the tested `uv.lock`; upgrade only through a contract fixture run.

## Hackathon defaults (decided — don't relitigate)

- `Circuit Model` JSON is canonical. Both adapters compile from it; imported code or OpenQASM must validate back into the same supported model.
- Prototype limits: 2–5 qubits, ≤20 operations, H/X/Y/Z/CNOT/Measure. Reject outside the subset before importing a quantum SDK.
- Parse submitted Qiskit with Python `ast` and an allowlist; NEVER `exec`, evaluate expressions, import arbitrary modules, access files or call the network.
- Qiskit Aer is numerical truth. Save the pre-measurement state for State Trace; sample measurement counts in a separate execution/result path.
- Normalize Qiskit and PennyLane wire/basis order at the adapter boundary with one tested mapping function.
- PennyLane `default.qubit` is a Bell-path conformance adapter. Compare ideal basis probabilities with epsilon `1e-6`; finite-shot counts are never exact-equality evidence.
- JSON complex numbers are `{re, im}`. Reject NaN/Infinity; probabilities must be finite, within `[0,1]`, and sum within tolerance.
- Reduced single-qubit Bloch values come from partial density matrices. Purity `<1` must carry `MIXED_SUBSYSTEM`.
- OpenQASM 3 is supported-subset export, not lossless persistence. Round-trip tests must preserve the Circuit Model or fail explicitly.
- Run CPU-bound SDK calls outside the async event loop. Timeout is 1500ms for the demo subset; return `SIMULATION_TIMEOUT`, never a hung request.
- Fixture truth includes basis order, ideal probabilities, expected trace length, reduced-state purity and tolerance. Bell support is `{00,11}` at `0.5/0.5`.
- Tutor and grading consume immutable Simulation Run evidence. They cannot modify probabilities, amplitudes, counts, trace steps or acceptance results.
- `ENABLE_PENNYLANE=0`, `ENABLE_TUTOR_CLOUD=0`, `DEMO_LOCAL=1` and cached Tutor responses must still complete the scripted journey.

## Traps that kill demos

- Saving after measurement records collapse, not the learning trace → save pre-measurement; sample afterward.
- Wire/bit endianness disagreement makes valid adapters look inconsistent → normalize before persistence and test asymmetric circuits, not Bell alone.
- Statevector cost grows as `2^n` → keep the hard qubit cap even on a fast laptop.
- SDK version confidence without a lockfile → the tested `uv.lock` is authoritative; the baseline is guidance, not permission to float dependencies.
- LLM explanations presented as verification → every numerical claim cites a valid Simulation Run evidence key.
