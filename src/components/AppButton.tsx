import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { minTapTarget, useTheme, type ColorTokens } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantColors: Record<Variant, { bg: keyof ColorTokens | null; fg: keyof ColorTokens }> = {
  primary: { bg: 'primary', fg: 'textOnPrimary' },
  accent: { bg: 'accent', fg: 'textOnAccent' },
  secondary: { bg: 'primarySoft', fg: 'primary' },
  ghost: { bg: null, fg: 'primary' },
};

export function AppButton({ title, onPress, variant = 'primary', icon, disabled, loading, style }: Props) {
  const { colors, radius, spacing, dark } = useTheme();
  const { bg, fg } = variantColors[variant];
  // In dark mode the soft violet background is too dim for violet text.
  const fgColor = variant === 'secondary' && dark ? 'text' : fg;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        styles.base,
        {
          backgroundColor: bg ? colors[bg] : 'transparent',
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          gap: spacing.xs,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[fgColor]} />
      ) : (
        <View style={[styles.row, { gap: spacing.xs }]}>
          {icon ? <Icon name={icon} size={22} color={colors[fgColor]} /> : null}
          <AppText variant="heading" color={fgColor}>
            {title}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTapTarget + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
