import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText, Card, Icon, PressableScale, Screen, type IconName } from '@/components';
import { t } from '@/lib/strings';
import { flag } from '@/lib/countries';
import { usePlayerStore } from '@/stores/playerStore';
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

      <AppText variant="caption" color="textMuted" align="center">
        {`${t.settings.version} ${Constants.expoConfig?.version ?? ''}`}
      </AppText>
    </Screen>
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
