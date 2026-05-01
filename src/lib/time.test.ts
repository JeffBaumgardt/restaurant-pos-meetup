import { describe, expect, it } from "vitest";
import { businessDayKeyLocal } from "@/lib/time";

describe("businessDayKeyLocal", () => {
  it("returns YYYY-MM-DD in local timezone", () => {
    const ms = new Date(2026, 4, 1, 23, 59, 0).getTime();
    expect(businessDayKeyLocal(ms)).toBe("2026-05-01");
  });
});
