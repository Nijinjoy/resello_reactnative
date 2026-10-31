const AVATAR_TINTS = ['#105E50', '#D9604A', '#2B7FB8', '#7A4FB8', '#D08A1F'];

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

export const avatarTint = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1000003;
  }
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function formatTime(date: Date) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (date >= startOfToday) {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (startOfToday.getTime() - date.getTime() < DAY_MS) {
    return 'Yesterday';
  }
  if (now.getTime() - date.getTime() < 7 * DAY_MS) {
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
