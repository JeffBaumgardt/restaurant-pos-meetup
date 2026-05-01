"use client";

import { findFloorTable } from "@/lib/table-layout";
import { cookingRemainingMs } from "@/lib/kitchen";
import type { OrderRow } from "@/lib/types";

export default function KitchenDock(props: {
  orders: OrderRow[];
  nowMs: number;
  onDeliver: (order: OrderRow) => void;
}) {
  const { orders, nowMs, onDeliver } = props;
  if (orders.length === 0) return null;

  return (
    <section
      aria-label="Kitchen queue"
      className="shrink-0 border-t border-zinc-800 bg-zinc-900 px-4 py-3"
      data-testid="kitchen-dock"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Kitchen
        </h3>
        <span className="text-[11px] text-zinc-500">
          Timers advance automatically for the demo
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {orders.map((o) => {
          const meta = findFloorTable(o.tableId);
          const remaining =
            o.status === "cooking" ? cookingRemainingMs(o, nowMs) : null;
          return (
            <div
              key={o.id}
              data-testid={`kitchen-order-${o.id}`}
              className="min-w-[180px] rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs shadow-inner"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white">
                  Table {meta?.label ?? o.tableId}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">
                  {o.status}
                </span>
              </div>
              {o.status === "cooking" && remaining !== null && (
                <p className="mt-1 text-emerald-300">
                  ~{Math.ceil(remaining / 1000)}s left
                </p>
              )}
              {o.status === "ready" && (
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg bg-sky-600 py-1 text-[11px] font-semibold text-white hover:bg-sky-500"
                  onClick={() => void onDeliver(o)}
                >
                  Deliver to floor
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
