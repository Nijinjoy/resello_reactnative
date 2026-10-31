import { NativeModules, Platform } from 'react-native';

type SmsUserConsentModule = {
  waitForSms: () => Promise<string | null>;
  stop: () => void;
};

// iOS fills the code from the keyboard via textContentType="oneTimeCode".
const native: SmsUserConsentModule | undefined =
  Platform.OS === 'android' ? NativeModules.SmsUserConsent : undefined;

let nextSms: Promise<string | null> = Promise.resolve(null);

// Call before the code is requested so a fast SMS isn't missed.
export function startSmsListener(): void {
  if (native) {
    nextSms = native.waitForSms().catch(() => null);
  }
}

export function stopSmsListener(): void {
  native?.stop();
}

export function extractOtp(message: string, length: number): string | null {
  return message.match(new RegExp(`\\b\\d{${length}}\\b`))?.[0] ?? null;
}

export async function waitForOtp(length: number): Promise<string | null> {
  const message = await nextSms;
  return message ? extractOtp(message, length) : null;
}
