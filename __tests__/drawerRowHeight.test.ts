import { drawerRowHeight } from '../src/screens/DrawerScreen';

jest.mock(
  'lucide-react-native',
  () => new Proxy({ __esModule: true }, { get: () => () => null }),
);
jest.mock('../src/services/session', () => ({}));
jest.mock('../src/services/authService', () => ({}));
jest.mock('../src/services/userService', () => ({}));

// Everything in the drawer other than the rows, with no safe-area insets.
const FIXED = 28 + 70 + 22 + 4 * 19 + 3 * 12;
const ROWS = 11;

test('rows fit exactly on a mid-size phone', () => {
  const height = 720;
  expect(FIXED + ROWS * drawerRowHeight(height, 0)).toBeLessThanOrEqual(height);
});

test('rows shrink to fit a short phone with insets', () => {
  const height = 640;
  const insets = 48;
  const row = drawerRowHeight(height, insets);
  expect(row).toBeLessThan(44);
  expect(FIXED + insets + ROWS * row).toBeLessThanOrEqual(height);
});

test('rows stop growing on tall screens', () => {
  expect(drawerRowHeight(1400, 0)).toBe(52);
});

test('rows keep a tappable minimum and leave the rest to scrolling', () => {
  expect(drawerRowHeight(360, 0)).toBe(32);
});
