import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, render } from "@testing-library/react";
import { NodePopover } from "@/features/learning/components/node-popover";

describe("DUO-4: In-Situ Anchored Popover with Pointing Beak Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. All 6 Content Fields & Typography Render Correctly", () => {
    it("renders stage number, category, title, objective, reward badges, star ratings, and CTA", () => {
      const handleStart = vi.fn();
      const handleClose = vi.fn();

      render(
        <NodePopover
          stageNumber={3}
          category="Foundation"
          title="The Hadamard Gate"
          objective="Rotate |0⟩ into equal superposition |+⟩"
          xp={50}
          shield={20}
          stars={2}
          onStart={handleStart}
          onClose={handleClose}
        />
      );

      // 1. Stage Number & Category
      expect(screen.getByTestId("popover-stage-number").textContent).toBe("STAGE 03");
      expect(screen.getByTestId("popover-category").textContent).toBe("Foundation");

      // 2. Title
      const titleEl = screen.getByTestId("popover-title");
      expect(titleEl.textContent).toBe("The Hadamard Gate");

      // 3. Objective micro-copy
      const objectiveEl = screen.getByTestId("popover-objective");
      expect(objectiveEl.textContent).toBe("Rotate |0⟩ into equal superposition |+⟩");

      // 4. Reward Badges (XP & Shield)
      const xpBadge = screen.getByTestId("popover-xp-badge");
      expect(xpBadge.textContent).toContain("+50⚡ Coherence");

      const shieldBadge = screen.getByTestId("popover-shield-badge");
      expect(shieldBadge.textContent).toContain("🛡️ +20% Shield");

      // 5. Star ratings (2 filled, 1 unfilled)
      const star1 = screen.getByTestId("popover-star-1");
      const star2 = screen.getByTestId("popover-star-2");
      const star3 = screen.getByTestId("popover-star-3");

      expect(star1.getAttribute("class")).toContain("fill-[#f59e0b]");
      expect(star2.getAttribute("class")).toContain("fill-[#f59e0b]");
      expect(star3.getAttribute("class")).toContain("stroke-[1.5]");

      // 6. Tactile CTA button
      const ctaBtn = screen.getByTestId("popover-cta");
      expect(ctaBtn.textContent).toContain("▶ START (+50 XP)");
    });

    it("respects custom ctaLabel when provided", () => {
      render(
        <NodePopover
          title="Superposition Review"
          ctaLabel="REVIEW LESSON"
        />
      );

      expect(screen.getByTestId("popover-cta").textContent).toContain("REVIEW LESSON");
    });

    it("renders nothing when isOpen is false", () => {
      const { container } = render(
        <NodePopover
          title="Hidden Stage"
          isOpen={false}
        />
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("node-popover")).toBeNull();
    });
  });

  describe("2. Anchoring Geometry & Pointing Beak Direction", () => {
    it("renders pointing beak downward (direction='down') when placed above node (placement='top')", () => {
      render(
        <NodePopover
          title="Hadamard Gate"
          placement="top"
        />
      );

      const beak = screen.getByTestId("popover-beak");
      expect(beak.getAttribute("data-placement")).toBe("top");
      expect(beak.getAttribute("data-direction")).toBe("down");
      expect(screen.getByTestId("node-popover").getAttribute("data-placement")).toBe("top");
    });

    it("renders pointing beak upward (direction='up') when placed below node (placement='bottom')", () => {
      render(
        <NodePopover
          title="Hadamard Gate"
          placement="bottom"
        />
      );

      const beak = screen.getByTestId("popover-beak");
      expect(beak.getAttribute("data-placement")).toBe("bottom");
      expect(beak.getAttribute("data-direction")).toBe("up");
      expect(screen.getByTestId("node-popover").getAttribute("data-placement")).toBe("bottom");
    });

    it("auto-computes placement='top' when anchor has ample clearance above", () => {
      // Mock anchorRect with top at 400px (ample space for 165px popover)
      const mockRect = {
        top: 400,
        bottom: 468,
        left: 200,
        right: 268,
        width: 68,
        height: 68,
      };

      render(
        <NodePopover
          title="Auto Top Popover"
          anchorRect={mockRect}
          placement="auto"
        />
      );

      const popover = screen.getByTestId("node-popover");
      const beak = screen.getByTestId("popover-beak");

      expect(popover.getAttribute("data-placement")).toBe("top");
      expect(beak.getAttribute("data-direction")).toBe("down");
    });

    it("auto-computes placement='bottom' when anchor is near viewport top (< 180px)", () => {
      // Mock anchorRect with top at 60px (insufficient space above)
      const mockRect = {
        top: 60,
        bottom: 128,
        left: 200,
        right: 268,
        width: 68,
        height: 68,
      };

      render(
        <NodePopover
          title="Auto Bottom Popover"
          anchorRect={mockRect}
          placement="auto"
        />
      );

      const popover = screen.getByTestId("node-popover");
      const beak = screen.getByTestId("popover-beak");

      expect(popover.getAttribute("data-placement")).toBe("bottom");
      expect(beak.getAttribute("data-direction")).toBe("up");
    });

    it("anchors dynamically using anchorRef getBoundingClientRect", () => {
      const anchorNode = document.createElement("button");
      vi.spyOn(anchorNode, "getBoundingClientRect").mockReturnValue({
        top: 350,
        bottom: 418,
        left: 300,
        right: 368,
        width: 68,
        height: 68,
        x: 300,
        y: 350,
        toJSON: () => {},
      });

      const anchorRef = { current: anchorNode };

      render(
        <NodePopover
          title="Ref Anchored Popover"
          anchorRef={anchorRef}
        />
      );

      const popover = screen.getByTestId("node-popover");
      expect(popover.getAttribute("data-placement")).toBe("top");
    });
  });

  describe("3. Dismissal Mechanics: Click-Outside & Esc Key", () => {
    it("calls onClose when Esc key is pressed", () => {
      const handleClose = vi.fn();

      render(
        <NodePopover
          title="Dismissible Popover"
          onClose={handleClose}
        />
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking outside the popover element", () => {
      const handleClose = vi.fn();

      render(
        <div>
          <button data-testid="outside-button">Outside</button>
          <NodePopover
            title="Dismissible Popover"
            onClose={handleClose}
          />
        </div>
      );

      fireEvent.mouseDown(screen.getByTestId("outside-button"));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("does NOT call onClose when clicking inside the popover", () => {
      const handleClose = vi.fn();

      render(
        <NodePopover
          title="Internal Click"
          onClose={handleClose}
        />
      );

      fireEvent.mouseDown(screen.getByTestId("popover-title"));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it("does NOT call onClose when clicking on the anchor element", () => {
      const handleClose = vi.fn();
      const anchor = document.createElement("div");
      document.body.appendChild(anchor);

      render(
        <NodePopover
          title="Anchor Safe Popover"
          anchorEl={anchor}
          onClose={handleClose}
        />
      );

      fireEvent.mouseDown(anchor);
      expect(handleClose).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });

    it("calls onClose when clicking the close button", () => {
      const handleClose = vi.fn();

      render(
        <NodePopover
          title="Close Button Test"
          onClose={handleClose}
        />
      );

      const closeBtn = screen.getByTestId("popover-close-btn");
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("4. Tactical CTA & Keyboard Operability (WCAG 2.1 AA)", () => {
    it("calls onStart when CTA button is clicked", () => {
      const handleStart = vi.fn();

      render(
        <NodePopover
          title="Launch Hadamard"
          xp={50}
          onStart={handleStart}
        />
      );

      const cta = screen.getByTestId("popover-cta");
      fireEvent.click(cta);
      expect(handleStart).toHaveBeenCalledTimes(1);
    });

    it("calls onStart when Enter key is pressed on CTA button", () => {
      const handleStart = vi.fn();

      render(
        <NodePopover
          title="Keyboard Launch"
          onStart={handleStart}
        />
      );

      const cta = screen.getByTestId("popover-cta");
      fireEvent.keyDown(cta, { key: "Enter" });
      expect(handleStart).toHaveBeenCalledTimes(1);
    });

    it("calls onStart when Space key is pressed on CTA button", () => {
      const handleStart = vi.fn();

      render(
        <NodePopover
          title="Space Launch"
          onStart={handleStart}
        />
      );

      const cta = screen.getByTestId("popover-cta");
      fireEvent.keyDown(cta, { key: " " });
      expect(handleStart).toHaveBeenCalledTimes(1);
    });

    it("has accessible dialog role and aria-label", () => {
      render(
        <NodePopover
          title="Quantum Entanglement Milestone"
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute("aria-label")).toBe("Quantum Entanglement Milestone");
    });
  });
});
