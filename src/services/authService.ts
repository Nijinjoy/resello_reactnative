import { api, ApiError } from './api';
import {
  clearSession,
  getSavedUser,
  getToken,
  saveToken,
  saveUser,
  User,
} from './session';
import { startSmsListener, stopSmsListener } from './smsOtp';
import { getProfile, withPictureUrl } from './userService';

const fakeLatency = () =>
  new Promise<void>(resolve => setTimeout(resolve, 1200));

type VerifyResult = {
  isNewUser: boolean;
};

export async function requestOtp(phone: string): Promise<void> {
  startSmsListener();
  try {
    await api.post('/auth/send-otp', { phoneNumber: phone });
  } catch (e) {
    stopSmsListener();
    throw e;
  }
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyResult> {
  const { data } = await api.post('/auth/verify-otp', {
    phoneNumber: phone,
    code,
  });
  await saveToken(data.data.token);
  await saveUser(withPictureUrl(data.data.user));
  return { isNewUser: !data.data.isProfileComplete };
}

export type StartRoute = 'Welcome' | 'Login' | 'ProfileSetup' | 'Main';

const routeFor = (user: User): StartRoute =>
  user.isProfileComplete ? 'Main' : 'ProfileSetup';

// Never rejects. A 401 ends the session; any other failure means the server
// couldn't confirm it, so the saved user keeps the app usable offline.
export async function restoreSession(): Promise<StartRoute> {
  try {
    if (!(await getToken())) {
      return 'Welcome';
    }
    try {
      const user = await getProfile();
      await saveUser(user);
      return routeFor(user);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await clearSession();
        return 'Login';
      }
      const saved = await getSavedUser();
      return saved ? routeFor(saved) : 'Login';
    }
  } catch {
    return 'Welcome';
  }
}

export async function signInWithGoogle(): Promise<VerifyResult> {
  await fakeLatency();
  return { isNewUser: true };
}

export type ProfileInput = {
  fullName: string;
  email: string;
  photoUri?: string;
};

export async function saveProfile({
  fullName,
  email,
  photoUri,
}: ProfileInput): Promise<void> {
  const form = new FormData();
  form.append('fullName', fullName);
  form.append('email', email);
  if (photoUri) {
    form.append('profilePicture', {
      uri: photoUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }
  const { data } = await api.post('/auth/complete-profile', form);
  await saveUser(withPictureUrl(data.data.user));
}

export async function deleteAccount(): Promise<void> {
  await fakeLatency();
}
