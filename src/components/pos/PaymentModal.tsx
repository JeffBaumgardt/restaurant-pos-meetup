"use client";

import type { KeyboardEvent } from "react";
import type { PaymentMethod } from "@/lib/types";
import { formatMoney } from "@/lib/format-money";

export default function PaymentModal(props: {
  open: boolean;
  totalCents: number;
  onClose: () => void;
  onPay: (method: PaymentMethod) => void;
}) {
  const { open, totalCents, onClose, onPay } = props;
  if (!open) return null;

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
      aria-labelledby="pay-title"
      tabIndex={-1}
      data-testid="payment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onKeyDown={handleDialogKeyDown}
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
        <h2 id="pay-title" className="text-lg font-semibold text-white">
          Take payment
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Amount due{" "}
          <span className="font-semibold text-white">
            {formatMoney(totalCents)}
          </span>
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            data-testid="payment-cash"
            className="rounded-xl border border-zinc-600 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
            onClick={() => onPay("cash")}
          >
            Cash
          </button>
          <button
            type="button"
            data-testid="payment-card"
            className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
            onClick={() => onPay("card")}
          >
            Card
          </button>
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-zinc-700 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
