import { ApiError } from '../src/services/api';
import { restoreSession } from '../src/services/authService';
import {
  clearSession,
  getSavedUser,
  getToken,
  saveUser,
} from '../src/services/session';
import { getProfile } from '../src/services/userService';

jest.mock('../src/services/session', () => ({
  clearSession: jest.fn(),
  getSavedUser: jest.fn(),
  getToken: jest.fn(),
  saveToken: jest.fn(),
  saveUser: jest.fn(),
}));
jest.mock('../src/services/userService');

const mocked = <T>(fn: T) => fn as unknown as jest.Mock;

const user = (isProfileComplete: boolean) => ({
  id: '1',
  phoneNumber: '+971500000000',
  fullName: null,
  email: null,
  profilePicture: null,
  isVerified: true,
  isProfileComplete,
});

beforeEach(() => {
  jest.resetAllMocks();
  mocked(getToken).mockResolvedValue('token');
  mocked(getSavedUser).mockResolvedValue(null);
});

test('no token goes to Welcome without calling the API', async () => {
  mocked(getToken).mockResolvedValue(null);
  await expect(restoreSession()).resolves.toBe('Welcome');
  expect(getProfile).not.toHaveBeenCalled();
});

test('valid session refreshes the saved user and goes to Main', async () => {
  const fresh = user(true);
  mocked(getProfile).mockResolvedValue(fresh);
  await expect(restoreSession()).resolves.toBe('Main');
  expect(saveUser).toHaveBeenCalledWith(fresh);
});

test('incomplete profile goes to ProfileSetup', async () => {
  mocked(getProfile).mockResolvedValue(user(false));
  await expect(restoreSession()).resolves.toBe('ProfileSetup');
});

test('401 clears the session and goes to Login', async () => {
  mocked(getSavedUser).mockResolvedValue(user(true));
  mocked(getProfile).mockRejectedValue(new ApiError('Expired', 401));
  await expect(restoreSession()).resolves.toBe('Login');
  expect(clearSession).toHaveBeenCalled();
});

test('offline falls back to the saved user and keeps the session', async () => {
  mocked(getSavedUser).mockResolvedValue(user(true));
  mocked(getProfile).mockRejectedValue(new ApiError('Offline'));
  await expect(restoreSession()).resolves.toBe('Main');
  expect(clearSession).not.toHaveBeenCalled();
});

test('server error with no saved user goes to Login', async () => {
  mocked(getProfile).mockRejectedValue(new ApiError('Down', 500));
  await expect(restoreSession()).resolves.toBe('Login');
  expect(clearSession).not.toHaveBeenCalled();
});

test('storage failure falls back to Welcome instead of rejecting', async () => {
  mocked(getToken).mockRejectedValue(new Error('Storage unavailable'));
  await expect(restoreSession()).resolves.toBe('Welcome');
});
