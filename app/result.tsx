import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppText, Card, Icon, Screen, type IconName } from '@/components';
import { lastRound } from '@/game/summary';
import { usePlayerStore } from '@/stores/playerStore';
import { getCategory } from '@/lib/categories';
import { formatNumber, t } from '@/lib/strings';
import { useTheme } from '@/theme';

export default function ResultScreen() {
  const { colors } = useTheme();
  // Read once: the summary belongs to the round that just ended.
  const [round] = useState(lastRound);
  const profile = usePlayerStore((s) => s.profile);
  // Filled in when the server confirms the daily score.
  const rank = usePlayerStore((s) => (round?.day && s.lastRank?.day === round.day ? s.lastRank.rank : null));

  if (!round) {
    return (
      <Screen edges={['top', 'bottom']} contentStyle={{ justifyContent: 'center' }}>
        <AppButton title={t.result.home} variant="secondary" icon="home" onPress={() => router.dismissAll()} />
      </Screen>
    );
  }

  const perfect = round.correct === round.total;
  const headline = perfect ? t.result.perfect : round.best ? t.result.newBest : round.outOfLives ? t.result.outOfLives : null;
  const title = round.mode === 'daily' ? t.home.dailyTitle : (getCategory(round.category)?.nameAr ?? t.result.title);

  return (
    <Screen edges={['top', 'bottom']} contentStyle={{ justifyContent: 'center' }}>
      <AppText variant="title" align="center">
        {title}
      </AppText>

      <Animated.View entering={ZoomIn.springify()}>
        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          {headline ? (
            <AppText variant="heading" color={round.outOfLives && !perfect ? 'danger' : 'success'}>
              {headline}
            </AppText>
          ) : null}
          <AppText color="textMuted">{t.result.score}</AppText>
          <AppText variant="display" color="primary">
            {formatNumber(round.score)}
          </AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150)} style={styles.stats}>
        <Stat icon="check-circle" color={colors.success} value={`${formatNumber(round.correct)} ${t.game.of} ${formatNumber(round.total)}`} label={t.result.correct} />
        <Stat icon="circle-multiple" color={colors.accent} value={`+${formatNumber(round.coins)}`} label={t.result.coins} />
        {round.streak ? <Stat icon="fire" color={colors.accent} value={formatNumber(round.streak)} label={t.result.streak} /> : null}
        {rank ? <Stat icon="trophy" color={colors.primary} value={`#${formatNumber(rank)}`} label={t.result.rank} /> : null}
      </Animated.View>

      {round.mode === 'daily' && !profile ? (
        <Animated.View entering={FadeInDown.delay(250)}>
          <Card>
            <AppText variant="heading">{t.leaderboard.joinTitle}</AppText>
            <AppText color="textMuted">{t.leaderboard.joinBody}</AppText>
            <AppButton title={t.leaderboard.join} variant="accent" icon="account-plus" onPress={() => router.push('/profile')} />
          </Card>
        </Animated.View>
      ) : null}

      <View style={{ gap: 12 }}>
        {round.mode === 'category' ? (
          <AppButton
            title={t.result.playAgain}
            icon="replay"
            onPress={() => router.replace({ pathname: '/game', params: { mode: 'category', category: round.category } })}
          />
        ) : (
          <AppButton title={t.result.leaderboard} icon="trophy" onPress={() => router.replace('/leaderboard')} />
        )}
        <AppButton title={t.result.home} variant="secondary" icon="home" onPress={() => router.dismissAll()} />
      </View>
    </Screen>
  );
}

function Stat({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  return (
    <Card style={styles.stat}>
      <Icon name={icon} size={26} color={color} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" color="textMuted" align="center">
        {label}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 14 },
});
