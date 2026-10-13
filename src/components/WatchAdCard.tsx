import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { watchAdForCoins } from '@/game/rewards';
import { AD_REWARD, rewardedAvailable } from '@/lib/ads';
import { formatNumber, t } from '@/lib/strings';
import { useShopStore } from '@/stores/shopStore';
import { useTheme } from '@/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** "Watch an ad, get 30 coins" (hidden when no ads can load or today's cap is used). */
export function WatchAdCard() {
  const { colors, radius, spacing } = useTheme();
  const left = useShopStore((s) => s.watchesLeft(AD_REWARD.perDay));
  const [busy, setBusy] = useState(false);
  if (!rewardedAvailable() || left <= 0) return null;

  const watch = async () => {
    setBusy(true);
    const result = await watchAdForCoins();
    setBusy(false);
    Alert.alert(result === 'earned' ? t.coins.earned : result === 'limit' ? t.coins.limit : t.coins.unavailable);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.accent, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }]}>
      <Icon name="gift" size={34} color={colors.accent} />
      <View style={styles.flex}>
        <AppText variant="heading">{t.coins.watchTitle}</AppText>
        <AppText variant="caption" color="textMuted">
          {t.coins.watchBody} · {formatNumber(left)} {t.coins.left}
        </AppText>
      </View>
      <AppButton title={t.coins.watch} variant="accent" onPress={watch} loading={busy} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5 },
  flex: { flex: 1 },
  button: { minHeight: 44, paddingHorizontal: 14 },
});
