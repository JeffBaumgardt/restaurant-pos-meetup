/** Demo POS card form: PAN length, security code, billing ZIP. */

export const CARD_NUMBER_DIGITS_LEN = 8;
export const CARD_CVC_DIGITS_LEN = 3;
export const CARD_ZIP_DIGITS_LEN = 5;

export function digitsOnly(value: string, maxLen: number): string {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

export function sanitizeCardNumberInput(value: string): string {
  return digitsOnly(value, CARD_NUMBER_DIGITS_LEN);
}

export function sanitizeCvcInput(value: string): string {
  return digitsOnly(value, CARD_CVC_DIGITS_LEN);
}

export function sanitizeZipInput(value: string): string {
  return digitsOnly(value, CARD_ZIP_DIGITS_LEN);
}

export function isCardPaymentFormComplete(
  cardNumberDigits: string,
  cvcDigits: string,
  zipDigits: string,
): boolean {
  return (
    cardNumberDigits.length === CARD_NUMBER_DIGITS_LEN &&
    cvcDigits.length === CARD_CVC_DIGITS_LEN &&
    zipDigits.length === CARD_ZIP_DIGITS_LEN
  );
}
