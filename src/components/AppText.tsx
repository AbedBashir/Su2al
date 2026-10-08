import { StyleSheet, Text, type TextProps } from 'react-native';

import { fontFamily, useTheme, type ColorTokens, type TypographyVariant } from '@/theme';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: keyof ColorTokens;
  /** Logical alignment: `start` is the right edge in RTL. */
  align?: 'start' | 'center' | 'end';
};

// With RTL enabled React Native swaps left/right, so 'left' renders at the start edge.
const alignMap = { start: 'left', center: 'center', end: 'right' } as const;

export function AppText({ variant = 'body', color = 'text', align = 'start', style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <Text
      {...rest}
      // Respect user font scaling, but cap it so layouts survive on small screens.
      maxFontSizeMultiplier={1.3}
      style={[
        styles.base,
        theme.typography[variant],
        { color: theme.colors[color], textAlign: alignMap[align] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily,
    writingDirection: 'rtl',
    // Android adds extra top padding to text by default, which misaligns Arabic glyphs.
    includeFontPadding: false,
  },
});
