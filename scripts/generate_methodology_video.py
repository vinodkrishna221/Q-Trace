#!/usr/bin/env python3
"""
scripts/generate_methodology_video.py -- SHIP-5 / Slide 3 Asset Generator
Generates the Q-Trace methodology walkthrough video using Veo 3.1.

Usage:
    python3 scripts/generate_methodology_video.py

Requires:
    pip install google-genai
    GEMINI_API_KEY env var set

Output:
    docs/deck/assets/slide3-methodology-loop.mp4
    docs/deck/assets/slide3-methodology-loop.gif  (after ffmpeg conversion)
"""

import os
import time
from pathlib import Path
from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "docs" / "deck" / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_MP4 = ASSETS_DIR / "slide3-methodology-loop.mp4"
OUTPUT_GIF = ASSETS_DIR / "slide3-methodology-loop.gif"

PROMPT = """A smooth, cinematic 8-second dark-mode UI walkthrough montage showing the Q-Trace quantum learning platform methodology loop, rendered as a sleek screen-recording flythrough:

[0s-1.5s] PREDICT -- A dark observatory-style web app opens on a 'Prediction Checkpoint' modal. A glowing teal label reads 'STEP 1 - PREDICTION CHECKPOINT'. A student selects the option 'CORRELATED_00_11 -- Entangled state: 50% |00> + 50% |11>'. A subtle pulse animation confirms the selection.

[1.5s-3s] BUILD & CODE -- The modal slides away revealing a full-screen Quantum Circuit Workspace. Two qubit wires appear. A Hadamard gate snaps onto qubit 0 with a satisfying click-flash glow, then a CNOT gate bridges qubit 0 to qubit 1. Simultaneously, Qiskit Python code animates into a CodeMirror panel on the right side in sync: 'qc.h(0); qc.cx(0,1); qc.measure_all()'.

[3s-4.5s] SIMULATE -- A 'Run Simulation' button pulses and is clicked. A loading spinner appears briefly. The screen splits: the left shows probability bars for |00> and |11> at 50% each, labeled 'Qiskit Aer'. The right shows a matching Bloch sphere visualization with glowing entangled axes. A green 'Dual Conformance: PennyLane OK' badge fades in.

[4.5s-6s] FLIGHT RECORDER -- The view smoothly transitions to the 'Quantum Flight Recorder' panel. A horizontal gate-by-gate state trace timeline appears: |00> -> H gate glow -> superposition state -> CNOT gate flashes red -> entangled Bell state. A diagnostic label fades in: 'FIRST DIVERGENCE DETECTED AT: CNOT - Signal: SUPERPOSITION_VS_ENTANGLEMENT'. Camera slowly zooms in on the divergence point.

[6s-8s] REPAIR LOOP -- The screen transitions to the AI Tutor card: dark card with teal accents, heading 'KEY PEDAGOGICAL INSIGHT'. A concise explanation appears with typewriter animation. Below it, a Repair Challenge card slides in: 'Restore Bell Correlation -- Modify the circuit so only |00> and |11> have non-zero probability.' A progress bar at the bottom of the screen smoothly fills to 80%, labeling 'Mastery: 80%'.

Style: Dark observatory UI palette (#0b0f19 background, #06b6d4 teal accents, #818cf8 indigo highlights). Smooth panel transitions with 200ms ease-in-out slide-and-fade. Text rendered in monospace JetBrains Mono for code, Inter for UI labels. Clean, professional tech product walkthrough -- no talking heads, no hands. Subtle UI ambient sound: soft key clicks, a gentle simulation ping at run, and a warm chime at repair completion. Camera: fixed screen-recording perspective, slight depth-of-field focus pull between panels."""


def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY environment variable is not set.")

    client = genai.Client(api_key=api_key)

    print("Submitting Veo 3.1 video generation request...")
    print(f"   Model  : veo-3.1-generate-preview")
    print(f"   Output : {OUTPUT_MP4.relative_to(ROOT)}")
    print()

    operation = client.models.generate_videos(
        model="veo-3.1-generate-preview",
        prompt=PROMPT,
        config=types.GenerateVideosConfig(
            aspect_ratio="16:9",
            resolution="1080p",
            number_of_videos=1,
        ),
    )

    # Poll until done
    print("Waiting for Veo to generate the video (this takes 1-6 minutes)...")
    elapsed = 0
    while not operation.done:
        time.sleep(15)
        elapsed += 15
        operation = client.operations.get(operation)
        print(f"   Still generating... ({elapsed}s elapsed)")

    print()
    print("Video generation complete!")

    # Download the video
    generated_video = operation.response.generated_videos[0]
    client.files.download(file=generated_video.video, destination=str(OUTPUT_MP4))
    print(f"   Saved MP4 -> {OUTPUT_MP4.relative_to(ROOT)}")

    # GIF conversion instructions
    print()
    print("To convert to a ~10-second GIF (0.8x playback speed):")
    print(f"   ffmpeg -i {OUTPUT_MP4.relative_to(ROOT)} \\")
    print(f'     -vf "fps=12,scale=1280:-1:flags=lanczos,setpts=1.25*PTS" \\')
    print(f"     -loop 0 {OUTPUT_GIF.relative_to(ROOT)}")
    print()
    print("   Or optimized palette GIF (smaller file, better colors):")
    print(f"   ffmpeg -i {OUTPUT_MP4.relative_to(ROOT)} \\")
    print(f'     -vf "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse,setpts=1.25*PTS" \\')
    print(f"     -loop 0 {OUTPUT_GIF.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
