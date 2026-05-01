"use client";

import type { KeyboardEvent } from "react";
import { MENU_MEALS } from "@/lib/meals";
import { orderLinesSubtotalCents } from "@/lib/tab-totals";
import type { OrderRow } from "@/lib/types";
import { formatMoney } from "@/lib/format-money";

export default function ReceiptModal(props: {
  open: boolean;
  title: string;
  tableLabel: string;
  orders: OrderRow[];
  onClose: () => void;
}) {
  const { open, title, tableLabel, orders, onClose } = props;
  if (!open) return null;

  const total = orders.reduce((acc, o) => acc + orderLinesSubtotalCents(o), 0);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-title"
      tabIndex={-1}
      data-testid="ticket-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onKeyDown={handleDialogKeyDown}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="ticket-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            <p className="text-sm text-zinc-400">Table {tableLabel}</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-zinc-600 px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-800"
            aria-label="Close ticket preview"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <ul className="mt-4 space-y-2 border-y border-zinc-800 py-4">
          {orders.flatMap((o) =>
            o.lines.map((line) => {
              const meal = MENU_MEALS.find((m) => m.id === line.mealId);
              const lineTotal = (meal?.priceCents ?? 0) * line.quantity;
              return (
                <li
                  key={`${o.id}-${line.mealId}`}
                  className="flex justify-between text-sm text-zinc-200"
                >
                  <span>
                    {meal?.name}{" "}
                    <span className="text-zinc-500">×{line.quantity}</span>
                  </span>
                  <span>{formatMoney(lineTotal)}</span>
                </li>
              );
            }),
          )}
        </ul>
        <div className="mt-4 flex items-center justify-between text-base font-semibold text-white">
          <span>Total</span>
          <span data-testid="ticket-total">{formatMoney(total)}</span>
        </div>
      </div>
    </div>
  );
}
