import { api, SERVER_URL } from './api';
import type { User } from './session';

// Keeps the splash screen from waiting long on a bad connection.
const PROFILE_TIMEOUT = 5000;

// The API returns the picture as a path relative to the server.
export const withPictureUrl = (user: User): User => ({
  ...user,
  profilePicture: user.profilePicture
    ? `${SERVER_URL}${user.profilePicture}`
    : null,
});

export async function getProfile(): Promise<User> {
  const { data } = await api.get('/users/profile', {
    timeout: PROFILE_TIMEOUT,
  });
  return withPictureUrl(data.data.user);
}
