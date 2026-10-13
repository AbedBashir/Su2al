import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, Switch, View } from 'react-native';

import { AppButton, AppText, Card, Icon, PressableScale, Screen, type IconName } from '@/components';
import { adsAvailable, showAdPrivacyOptions } from '@/lib/ads';
import { t } from '@/lib/strings';
import { flag } from '@/lib/countries';
import { usePlayerStore } from '@/stores/playerStore';
import { REMOVE_ADS, storeConfigured, useShopStore } from '@/stores/shopStore';
import { useSettingsStore, type ThemeMode } from '@/stores/settingsStore';
import { minTapTarget, useTheme } from '@/theme';

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: t.settings.themeSystem },
  { mode: 'light', label: t.settings.themeLight },
  { mode: 'dark', label: t.settings.themeDark },
];

export default function SettingsScreen() {
  const { colors, radius, spacing } = useTheme();
  const { themeMode, setThemeMode, soundEnabled, setSoundEnabled, hapticsEnabled, setHapticsEnabled } =
    useSettingsStore();
  const profile = usePlayerStore((s) => s.profile);

  return (
    <Screen scroll>
      <PressableScale onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={t.settings.profile}>
        <Card style={{ ...styles.row, gap: spacing.sm }}>
          <Icon name="account-circle" size={26} color={colors.primary} />
          <View style={styles.flex}>
            <AppText variant="heading">{t.settings.profile}</AppText>
            <AppText variant="caption" color="textMuted">
              {profile ? `${flag(profile.country)} ${profile.name}` : t.leaderboard.joinBody}
            </AppText>
          </View>
          <Icon name="chevron-left" size={26} color={colors.textMuted} />
        </Card>
      </PressableScale>

      <Card>
        <SectionTitle icon="theme-light-dark" title={t.settings.appearance} />
        <View style={[styles.segmented, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, gap: spacing.xxs }]}>
          {THEME_OPTIONS.map(({ mode, label }) => {
            const selected = mode === themeMode;
            return (
              <PressableScale
                key={mode}
                onPress={() => setThemeMode(mode)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.segment, { borderRadius: radius.sm, backgroundColor: selected ? colors.primary : 'transparent' }]}
              >
                <AppText variant="label" color={selected ? 'textOnPrimary' : 'text'}>
                  {label}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
      </Card>

      <Card>
        <ToggleRow icon="volume-high" title={t.settings.sound} value={soundEnabled} onChange={setSoundEnabled} />
        <ToggleRow icon="vibrate" title={t.settings.haptics} value={hapticsEnabled} onChange={setHapticsEnabled} />
      </Card>

      <RemoveAdsCard />

      <Card>
        {adsAvailable() ? (
          <LinkRow
            icon="shield-account"
            title={t.shop.adPrivacy}
            onPress={async () => {
              if (!(await showAdPrivacyOptions())) Alert.alert(t.shop.adPrivacy, t.shop.adPrivacyNone);
            }}
          />
        ) : null}
        {/* Cross-promotion: our other app. */}
        <LinkRow
          icon="apps"
          title={t.shop.moreApps}
          subtitle={t.shop.spendshot}
          onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.abedbashir.spendshot')}
        />
      </Card>

      <AppText variant="caption" color="textMuted" align="center">
        {`${t.settings.version} ${Constants.expoConfig?.version ?? ''}`}
      </AppText>
    </Screen>
  );
}

function RemoveAdsCard() {
  const { spacing } = useTheme();
  const { adsRemoved, product, buyRemoveAds, restore } = useShopStore();
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    setBusy(true);
    try {
      await buyRemoveAds();
    } catch {
      Alert.alert(t.shop.failed);
    } finally {
      setBusy(false);
    }
  };
  const restorePurchases = async () => {
    setBusy(true);
    try {
      Alert.alert((await restore()) ? t.shop.restored : t.shop.nothingToRestore);
    } catch {
      Alert.alert(t.shop.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <SectionTitle icon="cancel" title={t.shop.removeAdsTitle} />
      {adsRemoved ? (
        <AppText color="success">{t.shop.owned}</AppText>
      ) : (
        <>
          <AppText color="textMuted">{t.shop.removeAdsBody}</AppText>
          <AppButton
            title={storeConfigured && product ? `${t.shop.buy} · ${product.priceString}` : `${REMOVE_ADS.fallbackPrice} · ${t.shop.comingSoon}`}
            icon="cart"
            disabled={!storeConfigured || !product}
            loading={busy}
            onPress={buy}
          />
        </>
      )}
      {storeConfigured ? (
        <PressableScale onPress={restorePurchases} accessibilityRole="button" style={{ paddingVertical: spacing.xs }}>
          <AppText variant="label" color="primary" align="center">
            {t.shop.restore}
          </AppText>
        </PressableScale>
      ) : null}
    </Card>
  );
}

function LinkRow({ icon, title, subtitle, onPress }: { icon: IconName; title: string; subtitle?: string; onPress: () => void }) {
  const { colors, spacing } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={[styles.row, styles.toggleRow, { gap: spacing.sm }]}>
      <Icon name={icon} size={22} color={colors.primary} />
      <View style={styles.flex}>
        <AppText>{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevron-left" size={24} color={colors.textMuted} />
    </PressableScale>
  );
}

function SectionTitle({ icon, title }: { icon: IconName; title: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.xs }]}>
      <Icon name={icon} size={22} color={colors.primary} />
      <AppText variant="heading">{title}</AppText>
    </View>
  );
}

function ToggleRow({ icon, title, value, onChange }: { icon: IconName; title: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.row, styles.toggleRow, { gap: spacing.sm }]}>
      <Icon name={icon} size={22} color={colors.primary} />
      <AppText style={styles.flex}>{title}</AppText>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={title}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  toggleRow: { minHeight: minTapTarget },
  segmented: { flexDirection: 'row', padding: 4 },
  segment: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
