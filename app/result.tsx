import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppButton, AppText, Card, Screen } from '@/components';
import { formatNumber, t } from '@/lib/strings';

type Params = { mode?: 'daily' | 'category'; category?: string; score?: string };

export default function ResultScreen() {
  const { mode = 'daily', category, score = '0' } = useLocalSearchParams<Params>();

  return (
    <Screen edges={['top', 'bottom']} contentStyle={{ justifyContent: 'center' }}>
      <AppText variant="title" align="center">
        {t.result.title}
      </AppText>
      <Animated.View entering={ZoomIn.springify()}>
        <Card style={{ alignItems: 'center' }}>
          <AppText color="textMuted">{t.result.score}</AppText>
          <AppText variant="display" color="primary">
            {formatNumber(Number(score) || 0)}
          </AppText>
        </Card>
      </Animated.View>
      <View style={{ gap: 12 }}>
        {mode === 'category' ? (
          <AppButton
            title={t.result.playAgain}
            icon="replay"
            onPress={() => router.replace({ pathname: '/game', params: { mode, category } })}
          />
        ) : null}
        <AppButton title={t.result.home} variant="secondary" icon="home" onPress={() => router.dismissAll()} />
      </View>
    </Screen>
  );
}
