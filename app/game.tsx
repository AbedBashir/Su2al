import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppButton, AppText, Card, Screen } from '@/components';
import { getCategory } from '@/lib/categories';
import { t } from '@/lib/strings';

type Params = { mode?: 'daily' | 'category'; category?: string };

/** Placeholder: the real question engine lands in phase 2. */
export default function GameScreen() {
  const { mode = 'daily', category } = useLocalSearchParams<Params>();
  const label = mode === 'daily' ? t.home.dailyTitle : (getCategory(category)?.nameAr ?? '');

  return (
    <Screen edges={['top', 'bottom']}>
      <AppText variant="title" align="center">
        {label}
      </AppText>
      <Card>
        <AppText align="center" color="textMuted">
          {t.game.placeholder}
        </AppText>
      </Card>
      <View style={{ flex: 1 }} />
      <AppButton
        title={t.game.finish}
        onPress={() => router.replace({ pathname: '/result', params: { mode, category, score: '0' } })}
      />
    </Screen>
  );
}
