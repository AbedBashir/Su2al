import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText, Card, PressableScale, Screen } from '@/components';
import { ApiError } from '@/lib/api';
import { COUNTRIES, flag } from '@/lib/countries';
import { t } from '@/lib/strings';
import { usePlayerStore } from '@/stores/playerStore';
import { fontFamily, useTheme } from '@/theme';

/** Join the leaderboard (first time) or change the name and flag shown on it. */
export default function ProfileScreen() {
  const { colors, radius, spacing } = useTheme();
  const profile = usePlayerStore((s) => s.profile);
  const join = usePlayerStore((s) => s.join);
  const update = usePlayerStore((s) => s.update);
  const leave = usePlayerStore((s) => s.leave);
  const [name, setName] = useState(profile?.name ?? '');
  const [country, setCountry] = useState<string | null>(profile?.country ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const clean = name.replace(/\s+/g, ' ').trim();
    if (clean.length < 2) return setError(t.profile.nameHint);
    if (!country) return setError(t.profile.pickCountry);
    setBusy(true);
    try {
      if (profile) await update({ name: clean, country });
      else await join(clean, country);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t.leaderboard.offline);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(t.profile.deleteTitle, t.profile.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.profile.deleteConfirm,
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await leave();
            Alert.alert(t.profile.deleted);
            router.back();
          } catch {
            setError(t.leaderboard.offline);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <Screen edges={['bottom']}>
      {!profile ? (
        <AppText color="textMuted" align="center">
          {t.leaderboard.joinBody}
        </AppText>
      ) : null}
      <Card>
        <AppText variant="label">{t.profile.name}</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t.profile.namePlaceholder}
          placeholderTextColor={colors.textMuted}
          maxLength={20}
          autoCorrect={false}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, fontFamily, paddingHorizontal: spacing.md },
          ]}
        />
        <AppText variant="caption" color="textMuted">
          {t.profile.nameHint}
        </AppText>
      </Card>

      <AppText variant="label">{t.profile.country}</AppText>
      <FlatList
        data={COUNTRIES}
        keyExtractor={(c) => c.code}
        numColumns={3}
        style={styles.flex}
        columnWrapperStyle={{ gap: spacing.xs }}
        contentContainerStyle={{ gap: spacing.xs }}
        renderItem={({ item }) => {
          const selected = item.code === country;
          return (
            <PressableScale
              onPress={() => setCountry(item.code)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={item.nameAr}
              style={[
                styles.country,
                {
                  borderRadius: radius.md,
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <AppText style={styles.flag}>{flag(item.code)}</AppText>
              <AppText variant="caption" align="center" numberOfLines={1}>
                {item.nameAr}
              </AppText>
            </PressableScale>
          );
        }}
      />

      <View style={{ gap: spacing.xs }}>
        {error ? (
          <AppText color="danger" align="center">
            {error}
          </AppText>
        ) : null}
        <AppButton title={profile ? t.profile.save : t.leaderboard.join} icon="check" loading={busy} onPress={save} />
        {profile ? <AppButton title={t.profile.delete} variant="ghost" icon="delete-outline" disabled={busy} onPress={confirmDelete} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  input: { minHeight: 52, fontSize: 18, textAlign: 'right' },
  country: { flex: 1, alignItems: 'center', paddingVertical: 8, borderWidth: 1.5 },
  flag: { fontSize: 26, lineHeight: 34 },
});
