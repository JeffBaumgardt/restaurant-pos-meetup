import { describe, expect, it } from "vitest";
import {
  CARD_CVC_DIGITS_LEN,
  CARD_NUMBER_DIGITS_LEN,
  CARD_ZIP_DIGITS_LEN,
  digitsOnly,
  isCardPaymentFormComplete,
  sanitizeCardNumberInput,
  sanitizeCvcInput,
  sanitizeZipInput,
} from "./card-payment-fields";

describe("digitsOnly", () => {
  /**
   * When someone types letters or punctuation mixed with numbers, keep only the digits and stop at the maximum length allowed for that field.
   */
  it("strips non-digits and respects max length", () => {
    expect(digitsOnly("42a4-242b42", 8)).toBe("42424242");
    expect(digitsOnly("1234567890", 8)).toBe("12345678");
  });

  /**
   * If there are no digits at all, the cleaned value should be blank instead of leaving junk characters behind.
   */
  it("returns empty for non-digit input", () => {
    expect(digitsOnly("abc", 5)).toBe("");
  });
});

describe("card field sanitizers", () => {
  /**
   * Card numbers should accept pasted text with spaces, then normalize down to at most eight digits for our demo form.
   */
  it("caps card number at eight digits", () => {
    expect(sanitizeCardNumberInput("4242 4242 4242 4242")).toBe("42424242");
    expect(sanitizeCardNumberInput("4242424242424242")).toHaveLength(
      CARD_NUMBER_DIGITS_LEN,
    );
  });

  /**
   * The security code field should ignore spacing and never store more than three digits.
   */
  it("caps CVC at three digits", () => {
    expect(sanitizeCvcInput("12 34")).toBe("123");
    expect(sanitizeCvcInput("123456")).toHaveLength(CARD_CVC_DIGITS_LEN);
  });

  /**
   * The ZIP field should strip non-digits and stop at five digits, matching a typical U.S. postal code length.
   */
  it("caps ZIP at five digits", () => {
    expect(sanitizeZipInput("9410x7")).toBe("94107");
    expect(sanitizeZipInput("941071234")).toHaveLength(CARD_ZIP_DIGITS_LEN);
  });
});

describe("isCardPaymentFormComplete", () => {
  /**
   * The pay button should only be allowed when all three fields have exactly the lengths we expect for this demo (eight, three, and five digits).
   */
  it("is true only when lengths are 8, 3, and 5", () => {
    expect(isCardPaymentFormComplete("42424242", "123", "94107")).toBe(true);
    expect(isCardPaymentFormComplete("4242424", "123", "94107")).toBe(false);
    expect(isCardPaymentFormComplete("42424242", "12", "94107")).toBe(false);
    expect(isCardPaymentFormComplete("42424242", "123", "9410")).toBe(false);
  });
});
