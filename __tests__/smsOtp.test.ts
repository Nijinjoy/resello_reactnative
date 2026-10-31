import { extractOtp } from '../src/services/smsOtp';

describe('extractOtp', () => {
  test('finds the code inside the message', () => {
    expect(extractOtp('Your Resello code is 482913.', 6)).toBe('482913');
  });

  test('ignores digit runs of a different length', () => {
    expect(extractOtp('Ref 12345678: code 482913', 6)).toBe('482913');
  });

  test('returns null when no code is present', () => {
    expect(extractOtp('Welcome to Resello', 6)).toBeNull();
  });
});
