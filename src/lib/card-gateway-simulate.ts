/**
 * Demo-only fake card authorization (no PCI, no real networks).
 * Long delay suggests round-trip to “card networks”.
 */

/** Use this 8-digit PAN in the UI to demo a decline after processing completes. */
export const DEMO_CARD_DECLINE_PAN = "11111111";

const GATEWAY_DELAY_MS = 2_400;

export type CardGatewayResult =
  | { ok: true }
  | { ok: false; message: string };

export async function simulateCardGatewayAuthorization(
  cardNumberDigits: string,
): Promise<CardGatewayResult> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, GATEWAY_DELAY_MS);
  });

  if (cardNumberDigits === DEMO_CARD_DECLINE_PAN) {
    return {
      ok: false,
      message: "Issuer declined this transaction. Try another card or payment method.",
    };
  }

  return { ok: true };
}
