"use client";

import type { FloorTableDef, OrderRow, TableSessionRow } from "@/lib/types";
import { MENU_MEALS } from "@/lib/meals";
import { countLines } from "@/lib/meal-draft";
import { formatDwellLabel } from "@/lib/dwell-time";
import { orderLinesSubtotalCents } from "@/lib/tab-totals";
import { formatMoney } from "@/lib/format-money";

export default function TableServicePanel(props: {
  hydrated: boolean;
  selectedTableId: string | null;
  selectedMeta: FloorTableDef | undefined;
  session: TableSessionRow | undefined;
  draft: OrderRow | undefined;
  selectedOrders: OrderRow[];
  tabTotal: number;
  nowMs: number;
  tableHasKitchenWorkload: boolean;
  onAddMeal: (mealId: string) => void;
  onDecrementMeal: (mealId: string) => void;
  onSubmitOrder: () => void;
  onMarkDelivered: (order: OrderRow) => void;
  onOpenTicketPreview: () => void;
  onOpenPay: () => void;
  onClearTableSelection: () => void;
}) {
  const {
    hydrated,
    selectedTableId,
    selectedMeta,
    session,
    draft,
    selectedOrders,
    tabTotal,
    nowMs,
    tableHasKitchenWorkload,
    onAddMeal,
    onDecrementMeal,
    onSubmitOrder,
    onMarkDelivered,
    onOpenTicketPreview,
    onOpenPay,
    onClearTableSelection,
  } = props;

  return (
    <aside
      aria-label="Orders for selected table"
      className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 lg:w-[380px]"
    >
      {!hydrated ? (
        <p className="text-sm text-zinc-400">Loading local data…</p>
      ) : !selectedTableId ? (
        <p className="text-sm text-zinc-400">
          Select a table on the floor to seat guests, fire orders, or close a
          check.
        </p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-white">
                Table {selectedMeta?.label ?? selectedTableId}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {session
                  ? `Guests seated · dwell ${formatDwellLabel(nowMs - session.occupiedSince)}`
                  : "Empty — adding a meal seats guests automatically."}
              </p>
            </div>
            <button
              type="button"
              aria-label="Leave table and return to floor overview"
              tabIndex={0}
              className="shrink-0 rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={onClearTableSelection}
            >
              Done
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Menu</h3>
            <div className="grid grid-cols-1 gap-2">
              {MENU_MEALS.map((meal) => (
                <button
                  key={meal.id}
                  type="button"
                  aria-label={`Add ${meal.name}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm hover:border-emerald-500 hover:bg-zinc-900"
                  onClick={() => void onAddMeal(meal.id)}
                >
                  <span>{meal.name}</span>
                  <span className="text-emerald-400">
                    {formatMoney(meal.priceCents)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">
                Working ticket
              </h3>
              {draft && (
                <span className="text-xs text-zinc-500">
                  {countLines(draft.lines)} items
                </span>
              )}
            </div>
            {!draft || draft.lines.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No unsent items yet for this table.
              </p>
            ) : (
              <ul className="space-y-2">
                {draft.lines.map((line) => {
                  const meal = MENU_MEALS.find((m) => m.id === line.mealId);
                  return (
                    <li
                      key={line.mealId}
                      className="flex items-center justify-between rounded-lg bg-zinc-950 px-3 py-2 text-sm"
                    >
                      <span>
                        {meal?.name}{" "}
                        <span className="text-zinc-500">×{line.quantity}</span>
                      </span>
                      <button
                        type="button"
                        className="rounded-md border border-zinc-600 px-2 py-0.5 text-xs hover:bg-zinc-800"
                        aria-label={`Remove one ${meal?.name ?? "item"}`}
                        onClick={() => void onDecrementMeal(line.mealId)}
                      >
                        −
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              type="button"
              className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
              disabled={!draft || draft.lines.length === 0}
              onClick={() => void onSubmitOrder()}
            >
              Submit to kitchen
            </button>
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <h3 className="text-sm font-medium text-zinc-300">
              Sent / kitchen / served
            </h3>
            <ul className="max-h-40 space-y-2 overflow-auto pr-1">
              {selectedOrders
                .filter((o) => o.status !== "draft")
                .map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="uppercase tracking-wide text-zinc-400">
                        {o.status}
                      </span>
                      <span>{formatMoney(orderLinesSubtotalCents(o))}</span>
                    </div>
                    {o.status === "ready" && (
                      <button
                        type="button"
                        className="rounded-md bg-sky-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-sky-500"
                        onClick={() => void onMarkDelivered(o)}
                      >
                        Mark delivered
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          </div>

          <div className="mt-auto space-y-3 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Open check</span>
              <span className="text-lg font-semibold text-white tabular-nums">
                {formatMoney(tabTotal)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={tabTotal <= 0}
                onClick={onOpenTicketPreview}
              >
                Ticket preview
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                disabled={tabTotal <= 0}
                onClick={onOpenPay}
              >
                Pay tab
              </button>
            </div>
            {tableHasKitchenWorkload && (
              <p className="text-[11px] text-zinc-500">
                This table still has items in the kitchen queue below.
              </p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
