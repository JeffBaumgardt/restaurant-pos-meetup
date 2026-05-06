import { describe, expect, it, vi } from "vitest";
import { handleFloorTableButtonKeyDown } from "@/components/pos/floor-table-keyboard";

describe("handleFloorTableButtonKeyDown", () => {
  /**
   * Keyboard users should be able to pick a table with the same key most forms use to activate buttons.
   */
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

  /**
   * Space is another standard way to activate controls without accidentally navigating away.
   */
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

  /**
   * Keys used for moving focus (like Tab) should not fire a table selection as if it were a click.
   */
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
