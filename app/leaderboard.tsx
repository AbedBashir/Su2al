import { AppText, Card, Icon, Screen } from '@/components';
import { t } from '@/lib/strings';
import { useTheme } from '@/theme';

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  return (
    <Screen scroll>
      <Card style={{ alignItems: 'center' }}>
        <Icon name="crown" size={48} color={colors.accent} />
        <AppText align="center" color="textMuted">
          {t.leaderboard.empty}
        </AppText>
      </Card>
    </Screen>
  );
}
