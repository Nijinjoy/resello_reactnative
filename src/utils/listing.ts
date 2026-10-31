export const FAVOURITE_TINT = '#E0475B';

export function formatAge(date: Date) {
  const hours = Math.floor((Date.now() - date.getTime()) / (60 * 60 * 1000));
  if (hours < 1) {
    return 'Just now';
  }
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}
