/** Kitchen prep duration shown in UI (ms) */
export const KITCHEN_PREP_MS = 12_000;

/** Seated duration at which the floor tile reads as fully red (older stays red). */
export const DWELL_OLD_MS = 2 * 60_000;

export type FloorTableAppearance = {
  className: string;
  style?: { background: string; color: string };
};

/**
 * Open tables: no fill so the floor reads clearly. Occupied: green when new,
 * shifting through yellow-orange to red by {@link DWELL_OLD_MS}.
 */
export function getFloorTableAppearance(
  elapsedMs: number | null,
): FloorTableAppearance {
  if (elapsedMs === null) {
    return {
      className:
        "border-zinc-400/80 bg-transparent text-zinc-100 ring-zinc-500/35 shadow-md",
    };
  }

  const t = Math.min(1, Math.max(0, elapsedMs / DWELL_OLD_MS));
  const hue = 142 * (1 - t);
  const saturation = 72 - 8 * t;
  const lightness = 43 - 12 * t;
  const background = `linear-gradient(145deg, hsl(${hue} ${saturation}% ${lightness + 7}%), hsl(${hue} ${saturation}% ${lightness - 9}%))`;
  const color = t < 0.42 ? "#050d14" : "#f8fafc";

  return {
    className: "border-black/35 ring-black/30 shadow-lg",
    style: { background, color },
  };
}

export function formatDwellLabel(elapsedMs: number | null): string {
  if (elapsedMs === null) return "Open";
  const totalSec = Math.floor(elapsedMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
