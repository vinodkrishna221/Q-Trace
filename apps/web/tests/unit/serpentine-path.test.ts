import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  SerpentinePath,
  getSerpentineAmplitude,
  getSinusoidalXOffset,
  calculateNodeCoordinates,
  generateCubicBezier,
  generateDualRailSpline,
  SERPENTINE_AMPLITUDES,
  type PathNodePoint,
} from "../../features/learning/components/serpentine-path";

describe("DUO-1: Sinusoidal Serpentine Path Canvas & SVG Bus Spline", () => {
  describe("1. Sinusoidal Coordinate Calculations & Breakpoint Amplitudes", () => {
    it("returns correct sinusoidal amplitude across all spec breakpoints (390px, 720px, 800px, 1440px)", () => {
      // Mobile portrait (< 640px) -> ±42px
      expect(getSerpentineAmplitude(320)).toBe(42);
      expect(getSerpentineAmplitude(390)).toBe(SERPENTINE_AMPLITUDES.MOBILE);
      expect(getSerpentineAmplitude(639)).toBe(42);

      // Mobile landscape / Small Tablet (640px – 768px) -> ±68px
      expect(getSerpentineAmplitude(640)).toBe(SERPENTINE_AMPLITUDES.LANDSCAPE);
      expect(getSerpentineAmplitude(720)).toBe(68);
      expect(getSerpentineAmplitude(768)).toBe(68);

      // Tablet / Small Laptop (769px – 1023px) -> ±96px
      expect(getSerpentineAmplitude(769)).toBe(SERPENTINE_AMPLITUDES.TABLET);
      expect(getSerpentineAmplitude(800)).toBe(96);
      expect(getSerpentineAmplitude(1023)).toBe(96);

      // Desktop High-Res (≥ 1024px) -> ±120px
      expect(getSerpentineAmplitude(1024)).toBe(SERPENTINE_AMPLITUDES.DESKTOP);
      expect(getSerpentineAmplitude(1280)).toBe(120);
      expect(getSerpentineAmplitude(1440)).toBe(120);
      expect(getSerpentineAmplitude(1920)).toBe(120);
    });

    it("verifies SVG path coordinate calculations produce correct sinusoidal x-offsets at 390px viewport width", () => {
      const mobileWidth = 390;
      const expectedAmp = 42;

      // Node 0: Center (offset 0)
      const offset0 = getSinusoidalXOffset(0, mobileWidth);
      expect(offset0).toBe(0);

      // Node 1: Swing Right (+42px)
      const offset1 = getSinusoidalXOffset(1, mobileWidth);
      expect(offset1).toBe(expectedAmp);

      // Node 2: Center (offset 0)
      const offset2 = getSinusoidalXOffset(2, mobileWidth);
      expect(Math.abs(offset2)).toBeLessThanOrEqual(0.01);

      // Node 3: Swing Left (-42px)
      const offset3 = getSinusoidalXOffset(3, mobileWidth);
      expect(offset3).toBe(-expectedAmp);

      // Node 4: Center (offset 0)
      const offset4 = getSinusoidalXOffset(4, mobileWidth);
      expect(Math.abs(offset4)).toBeLessThanOrEqual(0.01);

      // Node 5: Swing Right (+42px)
      const offset5 = getSinusoidalXOffset(5, mobileWidth);
      expect(offset5).toBe(expectedAmp);
    });

    it("verifies SVG path coordinate calculations produce correct sinusoidal x-offsets at 1440px viewport width", () => {
      const desktopWidth = 1440;
      const expectedAmp = 120;

      // Node 0: Center (offset 0)
      expect(getSinusoidalXOffset(0, desktopWidth)).toBe(0);

      // Node 1: Peak Right (+120px)
      expect(getSinusoidalXOffset(1, desktopWidth)).toBe(expectedAmp);

      // Node 2: Center (offset 0)
      expect(Math.abs(getSinusoidalXOffset(2, desktopWidth))).toBeLessThanOrEqual(0.01);

      // Node 3: Peak Left (-120px)
      expect(getSinusoidalXOffset(3, desktopWidth)).toBe(-expectedAmp);

      // Node 4: Return to center
      expect(Math.abs(getSinusoidalXOffset(4, desktopWidth))).toBeLessThanOrEqual(0.01);

      // All offsets must strictly stay within [-120, +120]
      for (let i = 0; i < 20; i++) {
        const offset = getSinusoidalXOffset(i, desktopWidth);
        expect(offset).toBeGreaterThanOrEqual(-expectedAmp);
        expect(offset).toBeLessThanOrEqual(expectedAmp);
      }
    });

    it("calculateNodeCoordinates attaches computed coordinates, respects startY, ySpacing, and centerX", () => {
      const mockNodes: PathNodePoint[] = [
        { id: "node-1", status: "completed" },
        { id: "node-2", status: "completed" },
        { id: "node-3", status: "active" },
        { id: "node-4", status: "locked" },
      ];

      const centerX = 300;
      const startY = 50;
      const ySpacing = 100;

      const coords = calculateNodeCoordinates(mockNodes, {
        viewportWidth: 1440,
        centerX,
        startY,
        ySpacing,
      });

      expect(coords).toHaveLength(4);
      expect(coords[0]).toMatchObject({
        id: "node-1",
        x: centerX + 0, // 300
        y: startY + 0 * ySpacing, // 50
        status: "completed",
        xOffset: 0,
      });

      expect(coords[1]).toMatchObject({
        id: "node-2",
        x: centerX + 120, // 420
        y: startY + 1 * ySpacing, // 150
        status: "completed",
        xOffset: 120,
      });

      expect(coords[2]).toMatchObject({
        id: "node-3",
        x: centerX + 0, // 300
        y: startY + 2 * ySpacing, // 250
        status: "active",
        xOffset: 0,
      });

      expect(coords[3]).toMatchObject({
        id: "node-4",
        x: centerX - 120, // 180
        y: startY + 3 * ySpacing, // 350
        status: "locked",
        xOffset: -120,
      });
    });
  });

  describe("2. Dual-Rail Spline Geometry & Bezier Curve Generation", () => {
    it("generates smooth cubic bezier curves with vertical tangency", () => {
      const p0 = { x: 200, y: 50 };
      const p1 = { x: 320, y: 150 };
      const bezier = generateCubicBezier(p0, p1, 0.5);

      expect(bezier).toMatch(/^M 200 50 C 200 \d+(\.\d+)?, 320 \d+(\.\d+)?, 320 150$/);
      // Control point 1 should have p0.x, control point 2 should have p1.x
      expect(bezier).toContain("C 200 100, 320 100, 320 150");
    });

    it("generates dual-rail path data with precise parallel rail spacing", () => {
      const points = [
        { x: 200, y: 60, status: "completed", id: "stage-1" },
        { x: 320, y: 170, status: "active", id: "stage-2" },
        { x: 200, y: 280, status: "locked", id: "stage-3" },
      ];

      const railSpacing = 8;
      const { fullRail1Path, fullRail2Path, fullCenterPath, segments } =
        generateDualRailSpline(points, railSpacing);

      expect(fullCenterPath).toContain("M 200 60");
      // Rail 1 offset by -4px
      expect(fullRail1Path).toContain("M 196 60");
      // Rail 2 offset by +4px
      expect(fullRail2Path).toContain("M 204 60");

      expect(segments).toHaveLength(2);

      // Segment 0: between stage-1 and stage-2 (active/completed)
      expect(segments[0].fromId).toBe("stage-1");
      expect(segments[0].toId).toBe("stage-2");
      expect(segments[0].status).toBe("active");
      expect(segments[0].isLocked).toBe(false);
      expect(segments[0].isActiveOrCompleted).toBe(true);
      expect(segments[0].rail1Path).toContain("196");
      expect(segments[0].rail2Path).toContain("204");

      // Segment 1: between stage-2 and stage-3 (locked)
      expect(segments[1].fromId).toBe("stage-2");
      expect(segments[1].toId).toBe("stage-3");
      expect(segments[1].status).toBe("locked");
      expect(segments[1].isLocked).toBe(true);
      expect(segments[1].isActiveOrCompleted).toBe(false);
    });
  });

  describe("3. SerpentinePath Component Rendering & Telemetry Presence", () => {
    const testNodes: PathNodePoint[] = [
      { id: "node-1", status: "completed", title: "Ground State" },
      { id: "node-2", status: "completed", title: "Hadamard Rotation" },
      { id: "node-3", status: "active", title: "Prediction Checkpoint" },
      { id: "node-4", status: "locked", title: "Entanglement Lab" },
      { id: "node-5", status: "locked", title: "Capstone Boss" },
    ];

    it("renders the SVG canvas with dual-rail background tracks", () => {
      render(React.createElement(SerpentinePath, { nodes: testNodes, viewportWidth: 1440 }));

      const svg = screen.getByTestId("serpentine-path-canvas");
      expect(svg).toBeDefined();
      expect(svg.tagName.toLowerCase()).toBe("svg");

      // Dual-rail background tracks
      const rail1 = screen.getByTestId("serpentine-rail-1");
      const rail2 = screen.getByTestId("serpentine-rail-2");
      expect(rail1).toBeDefined();
      expect(rail2).toBeDefined();
      expect(rail1.getAttribute("d")).toBeTruthy();
      expect(rail2.getAttribute("d")).toBeTruthy();
    });

    it("renders stroke-dashoffset animation class on active and completed segments", () => {
      render(
        React.createElement(SerpentinePath, {
          nodes: testNodes,
          viewportWidth: 1440,
          pulseAnimation: true,
        })
      );

      // Segment 0 (node-1 to node-2: completed)
      const voltageStream0 = screen.getByTestId("serpentine-voltage-stream-0");
      expect(voltageStream0).toBeDefined();
      const paths0 = voltageStream0.querySelectorAll("path");
      expect(paths0.length).toBe(2); // dual-rail
      paths0.forEach((path) => {
        expect(path.classList.contains("animate-coherence-stream")).toBe(true);
        expect(path.getAttribute("stroke")).toBe("url(#coherence-voltage-gradient)");
      });

      // Segment 1 (node-2 to node-3: active)
      const voltageStream1 = screen.getByTestId("serpentine-voltage-stream-1");
      expect(voltageStream1).toBeDefined();
      const paths1 = voltageStream1.querySelectorAll("path");
      expect(paths1.length).toBe(2);
      paths1.forEach((path) => {
        expect(path.classList.contains("animate-coherence-stream")).toBe(true);
      });
    });

    it("renders dashed strokes without voltage animation on locked segments", () => {
      render(React.createElement(SerpentinePath, { nodes: testNodes, viewportWidth: 1440 }));

      // Segment 2 (node-3 to node-4: locked)
      const lockedSeg2 = screen.getByTestId("serpentine-segment-locked-2");
      expect(lockedSeg2).toBeDefined();
      const lockedPaths = lockedSeg2.querySelectorAll("path");
      expect(lockedPaths.length).toBe(2);
      lockedPaths.forEach((path) => {
        expect(path.getAttribute("stroke-dasharray")).toBe("2 6");
        expect(path.classList.contains("animate-coherence-stream")).toBe(false);
      });

      // Segment 3 (node-4 to node-5: locked)
      const lockedSeg3 = screen.getByTestId("serpentine-segment-locked-3");
      expect(lockedSeg3).toBeDefined();
    });

    it("is purely computational: does NOT render node buttons, badges, or lesson titles", () => {
      const { container } = render(
        React.createElement(SerpentinePath, { nodes: testNodes, viewportWidth: 1440 })
      );

      // No HTML buttons or text elements should exist inside the geometry canvas
      expect(container.querySelectorAll("button")).toHaveLength(0);
      expect(container.querySelectorAll("input")).toHaveLength(0);
      expect(screen.queryByText("Hadamard Rotation")).toBeNull();
      expect(screen.queryByText("Capstone Boss")).toBeNull();
    });

    it("handles explicit 2D coordinate points correctly", () => {
      const explicitPoints = [
        { x: 100, y: 50, status: "completed" as const },
        { x: 220, y: 160, status: "active" as const },
      ];

      render(React.createElement(SerpentinePath, { points: explicitPoints }));

      const rail1 = screen.getByTestId("serpentine-rail-1");
      expect(rail1.getAttribute("d")).toContain("M 96 50");
      const rail2 = screen.getByTestId("serpentine-rail-2");
      expect(rail2.getAttribute("d")).toContain("M 104 50");
    });

    it("renders safely when nodes list is empty or single node without crashing", () => {
      const { rerender } = render(React.createElement(SerpentinePath, { nodes: [] }));
      expect(screen.getByTestId("serpentine-path-canvas")).toBeDefined();

      rerender(
        React.createElement(SerpentinePath, {
          nodes: [{ id: "single-node", status: "active" }],
        })
      );
      expect(screen.getByTestId("serpentine-path-canvas")).toBeDefined();
    });
  });
});
