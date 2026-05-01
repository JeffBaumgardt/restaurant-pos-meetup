import type { FloorTableDef } from "./types";

/** 23 seats: symmetric booth rows on left/right; square tables in the center grid */
export const FLOOR_PLAN: FloorTableDef[] = [
  /* Left wall */
  { id: "t01", label: "B1", kind: "booth", xPct: 2, yPct: 8, wPct: 14, hPct: 11 },
  { id: "t02", label: "B2", kind: "booth", xPct: 2, yPct: 26, wPct: 14, hPct: 11 },
  { id: "t03", label: "B3", kind: "booth", xPct: 2, yPct: 44, wPct: 14, hPct: 11 },
  { id: "t04", label: "B4", kind: "booth", xPct: 2, yPct: 62, wPct: 14, hPct: 11 },
  { id: "t05", label: "B5", kind: "booth", xPct: 2, yPct: 78, wPct: 14, hPct: 11 },
  /* Interior grid */
  { id: "t06", label: "T6", kind: "table", xPct: 26, yPct: 14, wPct: 9, hPct: 9 },
  { id: "t07", label: "T7", kind: "table", xPct: 39, yPct: 14, wPct: 9, hPct: 9 },
  { id: "t08", label: "T8", kind: "table", xPct: 52, yPct: 14, wPct: 9, hPct: 9 },
  { id: "t09", label: "T9", kind: "table", xPct: 65, yPct: 14, wPct: 9, hPct: 9 },
  { id: "t10", label: "T10", kind: "table", xPct: 26, yPct: 34, wPct: 9, hPct: 9 },
  { id: "t11", label: "T11", kind: "table", xPct: 39, yPct: 34, wPct: 9, hPct: 9 },
  { id: "t12", label: "T12", kind: "table", xPct: 52, yPct: 34, wPct: 9, hPct: 9 },
  { id: "t15", label: "T15", kind: "table", xPct: 65, yPct: 34, wPct: 9, hPct: 9 },
  { id: "t16", label: "T16", kind: "table", xPct: 26, yPct: 54, wPct: 9, hPct: 9 },
  { id: "t17", label: "T17", kind: "table", xPct: 39, yPct: 54, wPct: 9, hPct: 9 },
  { id: "t18", label: "T18", kind: "table", xPct: 52, yPct: 54, wPct: 9, hPct: 9 },
  { id: "t19", label: "T19", kind: "table", xPct: 65, yPct: 54, wPct: 9, hPct: 9 },
  { id: "t20", label: "T20", kind: "table", xPct: 45.5, yPct: 74, wPct: 9, hPct: 9 },
  /* Right wall (mirrors left) */
  { id: "t13", label: "B6", kind: "booth", xPct: 84, yPct: 8, wPct: 14, hPct: 11 },
  { id: "t14", label: "B7", kind: "booth", xPct: 84, yPct: 26, wPct: 14, hPct: 11 },
  { id: "t21", label: "B8", kind: "booth", xPct: 84, yPct: 44, wPct: 14, hPct: 11 },
  { id: "t22", label: "B9", kind: "booth", xPct: 84, yPct: 62, wPct: 14, hPct: 11 },
  { id: "t23", label: "B10", kind: "booth", xPct: 84, yPct: 78, wPct: 14, hPct: 11 },
];

export function findFloorTable(tableId: string): FloorTableDef | undefined {
  return FLOOR_PLAN.find((t) => t.id === tableId);
}
