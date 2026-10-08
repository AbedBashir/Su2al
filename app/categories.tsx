import { router } from 'expo-router';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText, Icon, PressableScale, Screen } from '@/components';
import { CATEGORIES, type Category } from '@/lib/categories';
import { t } from '@/lib/strings';
import { useTheme } from '@/theme';

const COLUMNS = 2;

export default function CategoriesScreen() {
  const { radius, spacing } = useTheme();
  const { width } = useWindowDimensions();
  // Two equal columns that fill the width, sized for ~360dp low-end screens.
  const tileSize = (width - spacing.md * 2 - spacing.sm * (COLUMNS - 1)) / COLUMNS;

  const renderItem = ({ item }: { item: Category }) => (
    <PressableScale
      onPress={() => router.push({ pathname: '/game', params: { mode: 'category', category: item.id } })}
      accessibilityRole="button"
      accessibilityLabel={item.nameAr}
      style={[styles.tile, { width: tileSize, height: tileSize * 0.8, backgroundColor: item.color, borderRadius: radius.lg, gap: spacing.xs }]}
    >
      <Icon name={item.icon} size={44} color="#FFFFFF" />
      <AppText variant="heading" align="center" style={styles.tileText}>
        {item.nameAr}
      </AppText>
    </PressableScale>
  );

  return (
    <Screen edges={['bottom']} contentStyle={{ padding: 0 }}>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(c) => c.id}
        numColumns={COLUMNS}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.xs }}>
            <AppText color="textMuted">{t.categories.subtitle}</AppText>
          </View>
        }
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        columnWrapperStyle={{ gap: spacing.sm }}
        // Small list; render everything at once to avoid blank tiles while scrolling.
        initialNumToRender={CATEGORIES.length}
        showsVerticalScrollIndicator={false}
      />
      {/* Banner ad slot (phase 5) goes here. */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', padding: 8 },
  tileText: { color: '#FFFFFF' },
});
