import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_CARD_DECLINE_PAN,
  simulateCardGatewayAuthorization,
} from "./card-gateway-simulate";

describe("simulateCardGatewayAuthorization", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * The demo waits a moment before answering. We check that a normal-looking card number is still “pending” until that wait finishes, then comes back as approved.
   */
  it("resolves success after delay when card number is not the demo decline number", async () => {
    vi.useFakeTimers();
    const pending = simulateCardGatewayAuthorization("42424242");
    await vi.advanceTimersByTimeAsync(2399);
    let settled = false;
    void pending.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(2);
    await expect(pending).resolves.toEqual({ ok: true });
  });

  /**
   * One specific eight-digit card number is wired to fail on purpose so demos can show a decline message instead of a success.
   */
  it("returns decline when card number matches demo decline constant", async () => {
    vi.useFakeTimers();
    const pending = simulateCardGatewayAuthorization(DEMO_CARD_DECLINE_PAN);
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/declined/i),
    });
  });
});
