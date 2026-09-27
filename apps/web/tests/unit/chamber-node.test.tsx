import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { render } from "../test-utils";
import {
  ChamberNode,
  CHAMBER_ARCHETYPES,
  CHAMBER_STATES,
} from "@/features/learning/components/chamber-node";

describe("DUO-3: Tactile ChamberNode Component Suite", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  describe("1. All 6 Archetypes Render with Correct Glyph and Token", () => {
    it("renders Concept archetype with Atom glyph, --accent token, and CONCEPT descriptor", () => {
      render(
        <ChamberNode
          archetype={CHAMBER_ARCHETYPES.CONCEPT}
          state="active"
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-archetype")).toBe("NODE_CONCEPT");
      expect(button.getAttribute("data-token")).toBe("--accent");
      expect(screen.getByTestId("glyph-concept")).toBeDefined();
      expect(screen.getByTestId("chamber-node-descriptor").textContent).toBe("CONCEPT");
    });

    it("renders Prediction archetype with Compass glyph, --caution token, and PREDICT descriptor", () => {
      render(
        <ChamberNode
          archetype={CHAMBER_ARCHETYPES.PREDICTION}
          state="active"
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-archetype")).toBe("NODE_PREDICTION");
      expect(button.getAttribute("data-token")).toBe("--caution");
      expect(screen.getByTestId("glyph-prediction")).toBeDefined();
      expect(screen.getByTestId("chamber-node-descriptor").textContent).toBe("PREDICT");
    });

    it("renders Gate Lab archetype with gate glyph letter, --gate-h token, and GATE LAB descriptor", () => {
      render(
        <ChamberNode
          archetype={CHAMBER_ARCHETYPES.GATE_LAB}
          gateGlyph="H"
          state="active"
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-archetype")).toBe("NODE_GATE_LAB");
      expect(button.getAttribute("data-token")).toBe("--gate-h");
      const glyph = screen.getByTestId("glyph-gate-lab");
      expect(glyph.textContent).toBe("H");
      expect(screen.getByTestId("chamber-node-descriptor").textContent).toBe("GATE LAB");
    });

    it("renders Debug archetype with Activity glyph, --evidence-diverge token, and DEBUG descriptor", () => {
      render(
        <ChamberNode
          archetype={CHAMBER_ARCHETYPES.DEBUG}
          state="active"
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-archetype")).toBe("NODE_DEBUG");
      expect(button.getAttribute("data-token")).toBe("--evidence-diverge");
      expect(screen.getByTestId("glyph-debug")).toBeDefined();
      expect(screen.getByTestId("chamber-node-descriptor").textContent).toBe("DEBUG");
    });

    it("renders Milestone Boss archetype with Crown glyph, --violet token, and MILESTONE descriptor", () => {
      render(
        <ChamberNode
          archetype={CHAMBER_ARCHETYPES.MILESTONE}
          state="active"
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-archetype")).toBe("NODE_MILESTONE");
      expect(button.getAttribute("data-token")).toBe("--violet");
      expect(screen.getByTestId("glyph-milestone")).toBeDefined();
      expect(screen.getByTestId("chamber-node-descriptor").textContent).toBe("MILESTONE");
    });

    it("renders Bonus Vault archetype with Gift glyph, --text-secondary token, and BONUS descriptor", () => {
      render(
        <ChamberNode
          archetype={CHAMBER_ARCHETYPES.BONUS}
          state="active"
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-archetype")).toBe("NODE_BONUS");
      expect(button.getAttribute("data-token")).toBe("--text-secondary");
      expect(screen.getByTestId("glyph-bonus")).toBeDefined();
      expect(screen.getByTestId("chamber-node-descriptor").textContent).toBe("BONUS");
    });
  });

  describe("2. All 4 Interaction States Render Correct Opacity and Border", () => {
    it("renders STATE_LOCKED with opacity 0.45, --border-subtle, and Lock glyph", () => {
      render(
        <ChamberNode
          archetype="concept"
          state={CHAMBER_STATES.LOCKED}
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-state")).toBe("STATE_LOCKED");
      expect(button.style.opacity).toBe("0.45");
      expect(button.style.borderColor).toBe("var(--border-subtle)");
      expect(button.getAttribute("aria-disabled")).toBe("true");
      expect(screen.getByTestId("glyph-locked")).toBeDefined();
    });

    it("renders STATE_ACTIVE with opacity 1, --border-strong, and sonar beacon pulse", () => {
      render(
        <ChamberNode
          archetype="concept"
          state={CHAMBER_STATES.ACTIVE}
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-state")).toBe("STATE_ACTIVE");
      expect(button.style.opacity).toBe("1");
      expect(button.style.borderColor).toBe("var(--border-strong)");
      const beacon = screen.getByTestId("sonar-beacon");
      expect(beacon.className).toContain("animate-sonar-beacon");
    });

    it("renders STATE_COMPLETED with opacity 1 and --evidence-success Pine Emerald border", () => {
      render(
        <ChamberNode
          archetype="concept"
          state={CHAMBER_STATES.COMPLETED}
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-state")).toBe("STATE_COMPLETED");
      expect(button.style.opacity).toBe("1");
      expect(button.style.borderColor).toBe("var(--evidence-success)");
      expect(screen.getByTestId("glyph-completed")).toBeDefined();
    });

    it("renders STATE_DIVERGED with opacity 1, --evidence-diverge Amber border, and pulsing sonar pip", () => {
      render(
        <ChamberNode
          archetype="debug"
          state={CHAMBER_STATES.DIVERGED}
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.getAttribute("data-state")).toBe("STATE_DIVERGED");
      expect(button.style.opacity).toBe("1");
      expect(button.style.borderColor).toBe("var(--evidence-diverge)");
      expect(screen.getByTestId("divergence-sonar-pip")).toBeDefined();
    });
  });

  describe("3. Click Triggers Mechanical Squash Class", () => {
    it("applies mechanical squash class on click and calls onClick and onOpen", () => {
      const handleClick = vi.fn();
      const handleOpen = vi.fn();

      render(
        <ChamberNode
          archetype="concept"
          state="active"
          onClick={handleClick}
          onOpen={handleOpen}
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.className).not.toContain("squash");

      act(() => {
        fireEvent.click(button);
      });

      expect(button.className).toContain("squash");
      expect(button.className).toContain("mechanical-squash");
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleOpen).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(button.className).not.toContain("squash");
    });

    it("applies squash class on mousedown and removes it on mouseup", () => {
      render(
        <ChamberNode
          archetype="gate_lab"
          state="active"
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.className).not.toContain("squash");

      act(() => {
        fireEvent.mouseDown(button);
      });
      expect(button.className).toContain("squash");

      act(() => {
        fireEvent.mouseUp(button);
      });
      expect(button.className).not.toContain("squash");
    });
  });

  describe("4. Locked State Triggers Head-Shake Animation", () => {
    it("triggers animate-head-shake class on click when locked and prevents onOpen", () => {
      const handleClick = vi.fn();
      const handleOpen = vi.fn();

      render(
        <ChamberNode
          archetype="prediction"
          state="locked"
          onClick={handleClick}
          onOpen={handleOpen}
        />
      );

      const button = screen.getByTestId("chamber-node");
      expect(button.className).not.toContain("animate-head-shake");

      act(() => {
        fireEvent.click(button);
      });

      expect(button.className).toContain("animate-head-shake");
      expect(handleOpen).not.toHaveBeenCalled();
      expect(screen.getByTestId("chamber-node-tooltip")).toBeDefined();
      expect(screen.getByText("Complete prior stage to unlock")).toBeDefined();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(button.className).not.toContain("animate-head-shake");
    });
  });

  describe("5. Keyboard Enter/Space Interactions", () => {
    it("triggers onOpen and onClick on Enter key press", () => {
      const handleClick = vi.fn();
      const handleOpen = vi.fn();

      render(
        <ChamberNode
          archetype="concept"
          state="active"
          onClick={handleClick}
          onOpen={handleOpen}
        />
      );

      const button = screen.getByTestId("chamber-node");
      act(() => {
        fireEvent.keyDown(button, { key: "Enter" });
      });

      expect(button.className).toContain("squash");
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleOpen).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(200);
      });
    });

    it("triggers onLaunch and onClick on Space key press", () => {
      const handleClick = vi.fn();
      const handleLaunch = vi.fn();

      render(
        <ChamberNode
          archetype="gate_lab"
          state="active"
          onClick={handleClick}
          onLaunch={handleLaunch}
        />
      );

      const button = screen.getByTestId("chamber-node");
      act(() => {
        fireEvent.keyDown(button, { key: " " });
      });

      expect(button.className).toContain("squash");
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleLaunch).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(200);
      });
    });

    it("triggers head-shake and blocks launch on Enter/Space when locked", () => {
      const handleOpen = vi.fn();
      const handleLaunch = vi.fn();

      render(
        <ChamberNode
          archetype="milestone"
          state="locked"
          onOpen={handleOpen}
          onLaunch={handleLaunch}
        />
      );

      const button = screen.getByTestId("chamber-node");
      act(() => {
        fireEvent.keyDown(button, { key: "Enter" });
      });

      expect(button.className).toContain("animate-head-shake");
      expect(handleOpen).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        fireEvent.keyDown(button, { key: " " });
      });
      expect(handleLaunch).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });
    });
  });

  describe("6. Mastery Stars and Orbital Progress Ring", () => {
    it("renders 3-star rating with correct earned stars", () => {
      render(
        <ChamberNode
          archetype="concept"
          state="completed"
          stars={2}
          showStars={true}
        />
      );

      expect(screen.getByTestId("star-1-earned")).toBeDefined();
      expect(screen.getByTestId("star-2-earned")).toBeDefined();
      expect(screen.getByTestId("star-3-empty")).toBeDefined();
    });

    it("renders outer 1.5px orbital progress ring", () => {
      render(
        <ChamberNode
          archetype="concept"
          state="completed"
        />
      );

      const ring = screen.getByTestId("orbital-progress-ring");
      expect(ring).toBeDefined();
      const circle = ring.querySelector("circle");
      expect(circle).toBeDefined();
      expect(circle?.getAttribute("stroke-width")).toBe("1.5");
      expect(circle?.getAttribute("stroke")).toBe("var(--evidence-success)");
    });
  });
});
