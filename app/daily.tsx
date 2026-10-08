import { router } from 'expo-router';
import { View } from 'react-native';

import { AppButton, AppText, Card, Icon, Screen } from '@/components';
import { t } from '@/lib/strings';
import { useTheme } from '@/theme';

export default function DailyChallengeScreen() {
  const { colors, spacing } = useTheme();

  return (
    <Screen scroll>
      <Card>
        {t.daily.rules.map((rule) => (
          <View key={rule} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="star" size={20} color={colors.accent} />
            <AppText style={{ flex: 1 }}>{rule}</AppText>
          </View>
        ))}
      </Card>
      <View style={{ flex: 1 }} />
      <AppButton
        title={t.daily.start}
        icon="play"
        onPress={() => router.replace({ pathname: '/game', params: { mode: 'daily' } })}
      />
    </Screen>
  );
}
