import { createAsyncStorage } from '@react-native-async-storage/async-storage';

export type User = {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  profilePicture: string | null;
  isVerified: boolean;
  isProfileComplete: boolean;
};

const storage = createAsyncStorage('resello');
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export const getToken = () => storage.getItem(TOKEN_KEY);
export const saveToken = (token: string) => storage.setItem(TOKEN_KEY, token);

export const saveUser = (user: User) =>
  storage.setItem(USER_KEY, JSON.stringify(user));

export async function getSavedUser(): Promise<User | null> {
  const user = await storage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export const clearSession = () => storage.removeMany([TOKEN_KEY, USER_KEY]);
