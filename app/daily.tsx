import { router } from 'expo-router';
import { View } from 'react-native';

import { AppButton, AppText, Card, Icon, Screen } from '@/components';
import { dayKey } from '@/shared/quiz';
import { formatNumber, t } from '@/lib/strings';
import { useProgressStore } from '@/stores/progressStore';
import { useTheme } from '@/theme';

export default function DailyChallengeScreen() {
  const { colors, spacing } = useTheme();
  const today = useProgressStore((s) => s.daily[dayKey()]);

  return (
    <Screen scroll>
      {today ? (
        // One attempt per day: show how it went instead of the start button.
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <AppText variant="heading">{t.daily.played}</AppText>
          <AppText variant="display" color="primary">
            {formatNumber(today.score)}
          </AppText>
          <AppText color="textMuted">
            {formatNumber(today.correct)} {t.game.of} {formatNumber(today.total)} {t.result.correct}
          </AppText>
          <AppText color="textMuted">{t.daily.comeBack}</AppText>
        </Card>
      ) : (
        <Card>
          {t.daily.rules.map((rule) => (
            <View key={rule} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="star" size={20} color={colors.accent} />
              <AppText style={{ flex: 1 }}>{rule}</AppText>
            </View>
          ))}
        </Card>
      )}
      <View style={{ flex: 1 }} />
      {today ? (
        <AppButton title={t.result.leaderboard} icon="trophy" onPress={() => router.replace('/leaderboard')} />
      ) : (
        <AppButton title={t.daily.start} icon="play" onPress={() => router.replace({ pathname: '/game', params: { mode: 'daily' } })} />
      )}
    </Screen>
  );
}
