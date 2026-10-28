// Placeholders until the backend exists: replace each body with the real request.
const fakeLatency = () =>
  new Promise<void>(resolve => setTimeout(resolve, 1200));

// Sends a one-time login code to `phone` (E.164, e.g. "+971501234567").
export async function requestOtp(phone: string): Promise<void> {
  await fakeLatency();
  if (!phone) {
    throw new Error('Phone number is required');
  }
}

type VerifyResult = {
  // True when this phone has no profile yet, so the user should set one up.
  isNewUser: boolean;
};

// Checks the code sent to `phone`; rejects with a user-facing message if wrong.
export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyResult> {
  await fakeLatency();
  if (!phone || code.length !== 6) {
    throw new Error('That code is incorrect. Please try again.');
  }
  return { isNewUser: true };
}

export type ProfileInput = {
  fullName: string;
  email: string;
  // Local file URI from the image picker; omitted when the user skips it.
  photoUri?: string;
};

// Saves the signed-in user's profile, uploading the photo if one was picked.
export async function saveProfile(profile: ProfileInput): Promise<void> {
  await fakeLatency();
  if (!profile.fullName || !profile.email) {
    throw new Error('Name and email are required');
  }
}

// Permanently deletes the signed-in user's account and their listings.
export async function deleteAccount(): Promise<void> {
  await fakeLatency();
}
