"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { PaymentMethod } from "@/lib/types";
import { DEMO_CARD_DECLINE_PAN, simulateCardGatewayAuthorization } from "@/lib/card-gateway-simulate";
import {
  isCardPaymentFormComplete,
  sanitizeCardNumberInput,
  sanitizeCvcInput,
  sanitizeZipInput,
} from "@/lib/card-payment-fields";
import { formatMoney } from "@/lib/format-money";

type PayStep = "choose" | "card-details" | "processing" | "declined";

export default function PaymentModal(props: {
  open: boolean;
  totalCents: number;
  onClose: () => void;
  onPay: (method: PaymentMethod) => void;
}) {
  const { open, totalCents, onClose, onPay } = props;

  const [step, setStep] = useState<PayStep>("choose");
  const [cardNumber, setCardNumber] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [declineMessage, setDeclineMessage] = useState<string | null>(null);

  const modalActiveRef = useRef(false);

  useEffect(() => {
    modalActiveRef.current = open;
  }, [open]);

  const cardComplete = isCardPaymentFormComplete(cardNumber, cvc, zip);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    if (step === "processing") {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    onClose();
  }

  async function handleSubmitCardPayment() {
    if (!cardComplete) return;
    setDeclineMessage(null);
    setStep("processing");

    const pan = cardNumber;
    const result = await simulateCardGatewayAuthorization(pan);

    if (!modalActiveRef.current) return;

    if (!result.ok) {
      setDeclineMessage(result.message);
      setStep("declined");
      return;
    }

    onPay("card");
  }

  function handlePickDifferentPayment() {
    setDeclineMessage(null);
    setStep("choose");
  }

  function handleTryCardAgain() {
    setDeclineMessage(null);
    setStep("card-details");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- WAI-ARIA modal on div; native <dialog> omitted for layout */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-title"
        aria-busy={step === "processing"}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl outline-none"
        onKeyDown={handleDialogKeyDown}
      >
        <h2 id="pay-title" className="text-lg font-semibold text-white">
          Take payment
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Amount due{" "}
          <span className="font-semibold text-white">
            {formatMoney(totalCents)}
          </span>
        </p>

        {step === "choose" && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-xl border border-zinc-600 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                onClick={() => onPay("cash")}
              >
                Cash
              </button>
              <button
                type="button"
                className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
                onClick={() => setStep("card-details")}
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
          </>
        )}

        {step === "card-details" && (
          <>
            <p className="mt-4 text-xs text-zinc-500">
              Demo fields only — not connected to a real processor. Card number
              is 8 digits; CVC 3 digits; ZIP 5 digits.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="card-payment-number"
                  className="block text-xs font-medium text-zinc-400"
                >
                  Card number
                </label>
                <div className="mt-1 flex gap-3">
                  <Image
                    src="/credit-card-generic.svg"
                    alt=""
                    width={120}
                    height={76}
                    className="h-[52px] w-auto shrink-0 self-center rounded-md border border-zinc-700 bg-zinc-900"
                    draggable={false}
                  />
                  <div className="min-w-0 flex-1">
                    <input
                      id="card-payment-number"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-describedby="card-payment-number-hint"
                      className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="12345678"
                      maxLength={8}
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(sanitizeCardNumberInput(e.target.value))
                      }
                    />
                    <p
                      id="card-payment-number-hint"
                      className="mt-1 text-[11px] text-zinc-600"
                    >
                      Eight digits. Use{" "}
                      <span className="font-mono text-zinc-500">
                        {DEMO_CARD_DECLINE_PAN}
                      </span>{" "}
                      to simulate a decline.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="card-payment-cvc"
                    className="block text-xs font-medium text-zinc-400"
                  >
                    CVC
                  </label>
                  <input
                    id="card-payment-cvc"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={3}
                    className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(sanitizeCvcInput(e.target.value))}
                  />
                </div>
                <div>
                  <label
                    htmlFor="card-payment-zip"
                    className="block text-xs font-medium text-zinc-400"
                  >
                    ZIP code
                  </label>
                  <input
                    id="card-payment-zip"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="94107"
                    value={zip}
                    onChange={(e) => setZip(sanitizeZipInput(e.target.value))}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                disabled={!cardComplete}
                className="w-full min-h-11 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                onClick={() => void handleSubmitCardPayment()}
              >
                Charge card
              </button>
              <button
                type="button"
                className="w-full min-h-11 rounded-xl border border-zinc-600 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                onClick={() => setStep("choose")}
              >
                Back
              </button>
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-zinc-700 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
              onClick={onClose}
            >
              Cancel
            </button>
          </>
        )}

        {step === "processing" && (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Processing card payment"
            className="mt-8 flex flex-col items-center gap-4 py-4"
          >
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400"
              aria-hidden
            />
            <p className="text-center text-sm text-zinc-300">
              Processing payment…
            </p>
            <p className="text-center text-xs text-zinc-500">
              Sending authorization to the card networks.
            </p>
          </div>
        )}

        {step === "declined" && declineMessage && (
          <div className="mt-6 space-y-4">
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-xl border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-100"
            >
              <p className="font-semibold text-red-200">Payment declined</p>
              <p className="mt-1 text-red-100/90">{declineMessage}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full min-h-11 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
                onClick={handleTryCardAgain}
              >
                Try again
              </button>
              <button
                type="button"
                className="w-full min-h-11 rounded-xl border border-zinc-600 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                onClick={handlePickDifferentPayment}
              >
                Other payment method
              </button>
            </div>
            <button
              type="button"
              className="w-full rounded-xl border border-zinc-700 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
