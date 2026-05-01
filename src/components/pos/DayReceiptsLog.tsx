"use client";

import { formatMoney } from "@/lib/format-money";
import type { DayReceiptRow } from "@/lib/types";

function formatBusinessDayHeading(dayKey: string): string {
  const parts = dayKey.split("-").map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return dayKey;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPaidClock(paidAt: number): string {
  return new Date(paidAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DayReceiptsLog(props: {
  hydrated: boolean;
  businessDayKey: string;
  receipts: DayReceiptRow[];
  grandTotalCents: number;
}) {
  const { hydrated, businessDayKey, receipts, grandTotalCents } = props;

  return (
    <section
      aria-label="Receipts for today"
      className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-3"
      data-testid="day-receipts-log"
    >
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Receipts today
          </h3>
          <p className="text-[13px] text-zinc-500">
            {formatBusinessDayHeading(businessDayKey)} · closed checks only
          </p>
        </div>
        {hydrated && receipts.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">
              Day total
            </p>
            <p
              className="text-lg font-semibold text-emerald-400"
              data-testid="day-receipts-grand-total"
            >
              {formatMoney(grandTotalCents)}
            </p>
          </div>
        )}
      </div>

      {!hydrated ? (
        <p className="text-sm text-zinc-500">Loading receipt log…</p>
      ) : receipts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No closed checks yet today. When you take payment on a table, it
          appears here for your running log.
        </p>
      ) : (
        <ul className="max-h-36 space-y-2 overflow-auto pr-1">
          {receipts.map((r) => (
            <li key={r.id}>
              <details className="group rounded-lg border border-zinc-800 bg-zinc-900/80">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="font-medium text-zinc-200">
                    <span className="text-zinc-400">{formatPaidClock(r.paidAt)}</span>
                    <span className="mx-2 text-zinc-600">·</span>
                    Table {r.tableLabel}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        r.paymentMethod === "card"
                          ? "bg-emerald-950 text-emerald-300"
                          : "bg-amber-950 text-amber-200"
                      }`}
                    >
                      {r.paymentMethod}
                    </span>
                    <span className="font-semibold text-white">
                      {formatMoney(r.totalCents)}
                    </span>
                  </span>
                </summary>
                <ul className="border-t border-zinc-800 px-3 py-2 text-[11px] text-zinc-400">
                  {r.lines.map((line, idx) => (
                    <li
                      key={`${r.id}-${idx}-${line.mealId}`}
                      className="flex justify-between gap-2 py-0.5"
                    >
                      <span>
                        {line.mealName}{" "}
                        <span className="text-zinc-600">×{line.quantity}</span>
                      </span>
                      <span>{formatMoney(line.lineTotalCents)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
