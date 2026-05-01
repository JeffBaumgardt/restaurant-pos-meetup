import { describe, expect, it, vi } from "vitest";
import { handleFloorTableButtonKeyDown } from "@/components/pos/floor-table-keyboard";

describe("handleFloorTableButtonKeyDown", () => {
  it("selects on Enter", () => {
    const onSelect = vi.fn();
    const preventDefault = vi.fn();
    handleFloorTableButtonKeyDown(
      { key: "Enter", preventDefault },
      "t01",
      onSelect,
    );
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("t01");
  });

  it("selects on Space", () => {
    const onSelect = vi.fn();
    const preventDefault = vi.fn();
    handleFloorTableButtonKeyDown(
      { key: " ", preventDefault },
      "t02",
      onSelect,
    );
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("t02");
  });

  it("ignores other keys", () => {
    const onSelect = vi.fn();
    const preventDefault = vi.fn();
    handleFloorTableButtonKeyDown(
      { key: "Tab", preventDefault },
      "t01",
      onSelect,
    );
    expect(preventDefault).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
