/** Single place for wall-clock reads so UI handlers avoid direct Date.now lint noise. */
export function timestamp(): number {
  return Date.now();
}

/** Local calendar day `YYYY-MM-DD` for grouping daily receipts. */
export function businessDayKeyLocal(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
