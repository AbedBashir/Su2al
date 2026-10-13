import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, Icon, PressableScale, Screen } from '@/components';
import { api, type BoardEntry, type MyRank } from '@/lib/api';
import { flag } from '@/lib/countries';
import { formatNumber, t } from '@/lib/strings';
import { dayKey } from '@/shared/quiz';
import { usePlayerStore } from '@/stores/playerStore';
import { useTheme } from '@/theme';

type Tab = 'today' | 'allTime';
type Board = { entries: BoardEntry[]; me: MyRank; players?: number };

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const { colors, radius, spacing } = useTheme();
  const profile = usePlayerStore((s) => s.profile);
  const pending = usePlayerStore((s) => s.pending);
  const [tab, setTab] = useState<Tab>('today');
  const [boards, setBoards] = useState<Partial<Record<Tab, Board>>>({});
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    // A round finished offline goes up first, so it counts in what we show.
    await usePlayerStore.getState().flush();
    const token = usePlayerStore.getState().profile?.token;
    try {
      const [today, allTime] = await Promise.all([api.dailyTop(dayKey(), token), api.allTimeTop(token)]);
      setBoards({ today, allTime });
    } catch {
      setFailed(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const board = boards[tab];
  const meInList = board?.entries.some((e) => e.id === profile?.id);

  return (
    <Screen edges={['bottom']}>
      <View style={[styles.tabs, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
        {(['today', 'allTime'] as Tab[]).map((key) => {
          const selected = key === tab;
          return (
            <PressableScale
              key={key}
              onPress={() => setTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.tab, { borderRadius: radius.sm, backgroundColor: selected ? colors.primary : 'transparent' }]}
            >
              <AppText variant="label" color={selected ? 'textOnPrimary' : 'text'}>
                {key === 'today' ? t.leaderboard.today : t.leaderboard.allTime}
              </AppText>
            </PressableScale>
          );
        })}
      </View>

      {!profile ? (
        <Card style={{ gap: spacing.xs }}>
          <AppText variant="heading">{t.leaderboard.joinTitle}</AppText>
          <AppText color="textMuted">{t.leaderboard.joinBody}</AppText>
          <AppButton title={t.leaderboard.join} icon="account-plus" onPress={() => router.push('/profile')} />
        </Card>
      ) : null}
      {profile && pending ? (
        <AppText variant="caption" color="textMuted" align="center">
          {t.leaderboard.pendingNote}
        </AppText>
      ) : null}

      {failed && !board ? (
        <Card style={{ alignItems: 'center' }}>
          <Icon name="wifi-off" size={36} color={colors.textMuted} />
          <AppText color="textMuted" align="center">
            {t.leaderboard.offline}
          </AppText>
          <AppButton title={t.leaderboard.retry} variant="secondary" icon="refresh" onPress={refresh} />
        </Card>
      ) : !board ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={board.entries}
          keyExtractor={(e) => e.id}
          style={styles.flex}
          contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            tab === 'today' && board.players ? (
              <AppText variant="caption" color="textMuted" align="center">
                {formatNumber(board.players)} {t.leaderboard.players}
              </AppText>
            ) : null
          }
          ListEmptyComponent={
            <Card style={{ alignItems: 'center' }}>
              <Icon name="crown" size={44} color={colors.accent} />
              <AppText color="textMuted" align="center">
                {tab === 'today' ? t.leaderboard.empty : t.leaderboard.emptyAllTime}
              </AppText>
            </Card>
          }
          renderItem={({ item }) => <Row entry={item} mine={item.id === profile?.id} allTime={tab === 'allTime'} />}
        />
      )}

      {/* Your own position stays visible even outside the top 50. */}
      {board?.me && !meInList && profile ? (
        <Row
          entry={{ rank: board.me.rank, id: profile.id, name: profile.name, country: profile.country, score: board.me.score }}
          mine
          allTime={tab === 'allTime'}
        />
      ) : null}
    </Screen>
  );
}

function Row({ entry, mine, allTime }: { entry: BoardEntry; mine: boolean; allTime: boolean }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          borderRadius: radius.md,
          backgroundColor: mine ? colors.primarySoft : colors.surface,
          borderColor: mine ? colors.primary : colors.border,
        },
      ]}
    >
      <AppText variant="heading" style={styles.rank} align="center">
        {MEDALS[entry.rank - 1] ?? formatNumber(entry.rank)}
      </AppText>
      <AppText style={styles.flag}>{flag(entry.country)}</AppText>
      <AppText variant="label" style={styles.flex} numberOfLines={1}>
        {entry.name}
        {mine ? ` (${t.leaderboard.you})` : ''}
      </AppText>
      <View style={{ alignItems: 'flex-end' }}>
        <AppText variant="label" color="primary">
          {formatNumber(entry.score)}
        </AppText>
        {allTime && entry.games ? (
          <AppText variant="caption" color="textMuted">
            {formatNumber(entry.games)} {t.leaderboard.games}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { flexDirection: 'row', padding: 4, gap: 4 },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, minHeight: 58, borderWidth: 1 },
  rank: { width: 36 },
  flag: { fontSize: 22, lineHeight: 30 },
});
