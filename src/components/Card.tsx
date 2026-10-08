import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing.md,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
