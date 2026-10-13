import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppText, Icon, PressableScale, Screen, StatChip, WatchAdCard } from '@/components';
import { AdBanner } from '@/lib/ads';
import { dayKey } from '@/shared/quiz';
import { t } from '@/lib/strings';
import { liveStreak, useProgressStore } from '@/stores/progressStore';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const { colors, radius, spacing } = useTheme();
  const coins = useProgressStore((s) => s.coins);
  const streak = useProgressStore((s) => liveStreak(s));
  const playedToday = useProgressStore((s) => !!s.daily[dayKey()]);

  return (
    <Screen scroll edges={['top', 'bottom']}>
      {/* Top bar: stats on the start (right) side, settings on the end side. */}
      <View style={styles.row}>
        <View style={[styles.row, { gap: spacing.xs }]}>
          <StatChip icon="fire" iconColor={colors.accent} value={streak} label={t.home.streak} />
          <StatChip icon="circle-multiple" iconColor={colors.accent} value={coins} label={t.home.coins} />
        </View>
        <PressableScale
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel={t.home.settings}
          style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill }]}
        >
          <Icon name="cog" size={26} color={colors.text} />
        </PressableScale>
      </View>

      <Animated.View entering={FadeInDown.duration(400)} style={[styles.hero, { paddingVertical: spacing.lg }]}>
        <AppText variant="display" color="primary" align="center">
          {t.appName}
        </AppText>
        <AppText variant="body" color="textMuted" align="center">
          {t.tagline}
        </AppText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        style={[styles.dailyCard, { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md }]}
      >
        <View style={[styles.row, { justifyContent: 'flex-start', gap: spacing.sm }]}>
          <Icon name="calendar-star" size={36} color={colors.accent} />
          <View style={styles.flex}>
            <AppText variant="title" color="textOnPrimary">
              {t.home.dailyTitle}
            </AppText>
            <AppText variant="caption" color="textOnPrimary">
              {t.home.dailySubtitle}
            </AppText>
          </View>
        </View>
        <AppButton
          title={playedToday ? t.daily.played : t.home.dailyCta}
          variant="accent"
          icon={playedToday ? 'check' : 'play'}
          onPress={() => router.push('/daily')}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ gap: spacing.sm }}>
        <HomeTile
          icon="view-grid"
          title={t.home.categories}
          subtitle={t.home.categoriesSubtitle}
          onPress={() => router.push('/categories')}
        />
        <HomeTile icon="trophy" title={t.home.leaderboard} onPress={() => router.push('/leaderboard')} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(400)}>
        <WatchAdCard />
      </Animated.View>
      <View style={styles.flex} />
      <AdBanner />
    </Screen>
  );
}

function HomeTile({ icon, title, subtitle, onPress }: { icon: 'view-grid' | 'trophy'; title: string; subtitle?: string; onPress: () => void }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.row,
        styles.tile,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
        <Icon name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {/* In RTL "forward" points left. */}
      <Icon name="chevron-left" size={28} color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  hero: { alignItems: 'center' },
  dailyCard: {},
  tile: { borderWidth: 1, minHeight: 76, justifyContent: 'flex-start' },
  tileIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
});
