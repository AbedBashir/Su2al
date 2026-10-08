import { StyleSheet, View } from 'react-native';

import { formatNumber } from '@/lib/strings';
import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Props = { icon: IconName; iconColor: string; value: number; label: string };

export function StatChip({ icon, iconColor, value, label }: Props) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.chip,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.sm, gap: spacing.xxs },
      ]}
    >
      <Icon name={icon} size={20} color={iconColor} />
      <AppText variant="label">{formatNumber(value)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 40,
  },
});
