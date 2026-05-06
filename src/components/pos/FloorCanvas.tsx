"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { FLOOR_PLAN } from "@/lib/table-layout";
import { formatDwellLabel, getFloorTableAppearance } from "@/lib/dwell-time";
import type { TableSessionRow } from "@/lib/types";
import { handleFloorTableButtonKeyDown } from "./floor-table-keyboard";

export default function FloorCanvas(props: {
  sessions: Record<string, TableSessionRow>;
  selectedTableId: string | null;
  nowMs: number;
  onSelectTable: (tableId: string) => void;
  onClearSelection: () => void;
}) {
  const { sessions, selectedTableId, nowMs, onSelectTable, onClearSelection } =
    props;

  function handleFloorPaneClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    onClearSelection();
  }

  function handleTableButtonKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    tableId: string,
  ) {
    handleFloorTableButtonKeyDown(event, tableId, onSelectTable);
  }

  return (
    <section
      aria-label="Dining room layout"
      className="relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-amber-950/40 to-zinc-900 shadow-inner"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light">
        <div className="absolute inset-y-8 left-0 w-3 rounded-r-full bg-zinc-700" />
        <div className="absolute inset-y-12 right-0 w-10 rounded-l-3xl bg-zinc-700" />
      </div>
      {/* Floor pane clears selection on backdrop click; tables are real <button>s for keyboard users. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative h-full min-h-[400px] w-full"
        onClick={handleFloorPaneClick}
      >
        {FLOOR_PLAN.map((t) => {
          const occ = sessions[t.id];
          const dwellMs = occ ? nowMs - occ.occupiedSince : null;
          const appearance = getFloorTableAppearance(dwellMs);
          const selected = selectedTableId === t.id;
          const isSquareTable = t.kind === "table";
          const positionStyle = isSquareTable
            ? {
                left: `${t.xPct}%`,
                top: `${t.yPct}%`,
                width: `${t.wPct}%`,
                height: "auto" as const,
                aspectRatio: "1",
                ...appearance.style,
              }
            : {
                left: `${t.xPct}%`,
                top: `${t.yPct}%`,
                width: `${t.wPct}%`,
                height: `${t.hPct}%`,
                ...appearance.style,
              };
          return (
            <button
              key={t.id}
              type="button"
              aria-label={`Table ${t.label}${occ ? ", occupied" : ", empty"}`}
              aria-pressed={selected}
              tabIndex={0}
              onClick={() => void onSelectTable(t.id)}
              onKeyDown={(e) => handleTableButtonKeyDown(e, t.id)}
              className={`absolute flex flex-col items-center justify-center border-2 text-xs font-semibold ring-2 transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${appearance.className} ${
                selected ? "ring-4 ring-white" : ""
              } ${isSquareTable ? "aspect-square rounded-xl" : "rounded-2xl"}`}
              style={positionStyle}
            >
              <span>{t.label}</span>
              <span className="mt-0.5 text-[10px] font-normal opacity-90">
                {formatDwellLabel(dwellMs)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
