// Manrope, bundled from src/assets/fonts. Each weight is its own family because
// Android can't pick a weight from a custom family via `fontWeight`, so set
// `fontFamily` from here instead of using `fontWeight`.
export const fonts = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semibold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
  extrabold: 'Manrope-ExtraBold',
} as const;
