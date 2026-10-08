import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type Props = PropsWithChildren<{
  scroll?: boolean;
  /** Screens with a native header don't need the top inset. */
  edges?: Edge[];
  contentStyle?: ViewStyle;
}>;

export function Screen({ children, scroll = false, edges = ['bottom'], contentStyle }: Props) {
  const { colors, spacing } = useTheme();
  const padding = { padding: spacing.md, gap: spacing.md };

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, styles.grow, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grow: { flexGrow: 1 },
});
