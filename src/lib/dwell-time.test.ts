import { describe, expect, it } from "vitest";
import {
  DWELL_OLD_MS,
  formatDwellLabel,
  getFloorTableAppearance,
} from "@/lib/dwell-time";

describe("dwell-time helpers", () => {
  /**
   * Empty seats should read as available with calm styling instead of using the timer colors meant for occupied tables.
   */
  it("open tables have no heat fill", () => {
    const open = getFloorTableAppearance(null);
    expect(open.style).toBeUndefined();
    expect(open.className).toContain("bg-transparent");
    expect(formatDwellLabel(null)).toMatch(/Open/i);
  });

  /**
   * As guests stay longer, the floor map color should shift smoothly from “fresh” toward “needs attention,” without jumping wildly past the worst case.
   */
  it("ramps hue from green toward red through two minutes", () => {
    const fresh = getFloorTableAppearance(0);
    expect(fresh.style?.background).toMatch(/142/);

    const mid = getFloorTableAppearance(DWELL_OLD_MS / 2);
    expect(mid.style?.background).toMatch(/71/);

    const old = getFloorTableAppearance(DWELL_OLD_MS);
    expect(old.style?.background).toMatch(/hsl\(0 /);

    const capped = getFloorTableAppearance(DWELL_OLD_MS * 3);
    expect(capped.style?.background).toEqual(old.style?.background);
  });

  /**
   * Hosts think in minutes and seconds; the label should pad single-digit seconds so it reads like a clock.
   */
  it("formats mm:ss dwell timers", () => {
    expect(formatDwellLabel(125_000)).toBe("2:05");
    expect(formatDwellLabel(3_000)).toBe("0:03");
  });
});
