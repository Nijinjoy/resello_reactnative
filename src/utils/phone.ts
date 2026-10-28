// UAE mobile numbers: 9 digits starting with 5 (e.g. 50 123 4567).
export const PHONE = {
  flag: '🇦🇪',
  dialCode: '+971',
  length: 9,
  example: '50 123 4567',
} as const;

const DIAL_DIGITS = PHONE.dialCode.slice(1);

// Strips formatting and a pasted "+971" / leading "0", keeping the local digits.
export function normalizePhone(text: string): string {
  let digits = text.replace(/\D/g, '');
  if (digits.length > PHONE.length && digits.startsWith(DIAL_DIGITS)) {
    digits = digits.slice(DIAL_DIGITS.length);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, PHONE.length);
}

export function formatPhone(digits: string): string {
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5)]
    .filter(Boolean)
    .join(' ');
}

export function isValidPhone(digits: string): boolean {
  return digits.length === PHONE.length && digits.startsWith('5');
}

export function toE164(digits: string): string {
  return `${PHONE.dialCode}${digits}`;
}
