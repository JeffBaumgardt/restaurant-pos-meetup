import type { KeyboardEvent } from "react";

export function handleFloorTableButtonKeyDown(
  event: Pick<KeyboardEvent<Element>, "key" | "preventDefault">,
  tableId: string,
  onSelectTable: (id: string) => void,
): void {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  onSelectTable(tableId);
}
