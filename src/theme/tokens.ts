/**
 * Single source of truth for all design tokens.
 * Screens and components must read colors/spacing/typography from here
 * (via `useTheme()`), never hardcode them.
 */

const palette = {
  violet50: '#F6F3FF',
  violet100: '#EDE6FF',
  violet200: '#D9CCFF',
  violet400: '#9B7BFF',
  violet500: '#7C4DFF',
  violet600: '#6C3CE9',
  violet700: '#5527C9',
  violet900: '#241450',
  ink950: '#120B24',
  ink900: '#1C1433',
  ink800: '#271D45',
  ink700: '#352A5A',
  amber400: '#FFC53D',
  amber500: '#FFB020',
  green500: '#1FBF75',
  green600: '#14A363',
  red500: '#FF4D5E',
  red600: '#E53949',
  sky500: '#2EA8FF',
  white: '#FFFFFF',
  gray500: '#6B6485',
  gray300: '#B9B3CF',
} as const;

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  accent: string;
  textOnAccent: string;
  success: string;
  danger: string;
  info: string;
  overlay: string;
};

export const lightColors: ColorTokens = {
  background: palette.violet50,
  surface: palette.white,
  surfaceAlt: palette.violet100,
  border: palette.violet200,
  text: palette.ink950,
  textMuted: palette.gray500,
  textOnPrimary: palette.white,
  primary: palette.violet600,
  primaryPressed: palette.violet700,
  primarySoft: palette.violet100,
  accent: palette.amber500,
  textOnAccent: palette.ink950,
  success: palette.green600,
  danger: palette.red600,
  info: palette.sky500,
  overlay: 'rgba(18, 11, 36, 0.55)',
};

export const darkColors: ColorTokens = {
  background: palette.ink950,
  surface: palette.ink900,
  surfaceAlt: palette.ink800,
  border: palette.ink700,
  text: palette.white,
  textMuted: palette.gray300,
  textOnPrimary: palette.white,
  primary: palette.violet500,
  primaryPressed: palette.violet600,
  primarySoft: palette.violet900,
  accent: palette.amber400,
  textOnAccent: palette.ink950,
  success: palette.green500,
  danger: palette.red500,
  info: palette.sky500,
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

/** Must match the family registered by the expo-font config plugin in app.json. */
export const fontFamily = 'Tajawal';

export type FontWeight = '400' | '500' | '700' | '800';

/**
 * Arabic glyphs (dots, hamza, tashkeel) need generous line height,
 * otherwise diacritics get clipped on Android.
 */
export const typography = {
  display: { fontSize: 40, lineHeight: 60, fontWeight: '800' },
  title: { fontSize: 26, lineHeight: 40, fontWeight: '800' },
  heading: { fontSize: 20, lineHeight: 32, fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 28, fontWeight: '500' },
  label: { fontSize: 15, lineHeight: 24, fontWeight: '700' },
  caption: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
} as const satisfies Record<string, { fontSize: number; lineHeight: number; fontWeight: FontWeight }>;

export type TypographyVariant = keyof typeof typography;

/** Minimum tap target (dp). Material recommends 48. */
export const minTapTarget = 52;

export type Theme = {
  dark: boolean;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export const lightTheme: Theme = { dark: false, colors: lightColors, spacing, radius, typography };
export const darkTheme: Theme = { dark: true, colors: darkColors, spacing, radius, typography };
