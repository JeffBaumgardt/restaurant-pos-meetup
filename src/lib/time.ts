/** Single place for wall-clock reads so UI handlers avoid direct Date.now lint noise. */
export function timestamp(): number {
  return Date.now();
}
