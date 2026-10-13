import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme as NavTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { iconFonts } from '@/components';
import { ensureRTL } from '@/lib/rtl';
import { prepareAds } from '@/lib/ads';
import { usePlayerStore } from '@/stores/playerStore';
import { useShopStore } from '@/stores/shopStore';
import { t } from '@/lib/strings';
import { AppThemeProvider, fontFamily, useTheme } from '@/theme';

ensureRTL();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Tajawal is embedded natively by the expo-font config plugin; only the icon font loads at runtime.
  const [fontsLoaded, fontError] = useFonts(iconFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // A daily score finished offline goes up as soon as the app opens again.
  useEffect(() => {
    void usePlayerStore.getState().flush();
    // Purchases first, so someone who removed ads never gets a consent prompt or an ad.
    void useShopStore.getState().init().then(prepareAds);
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <RootNavigator />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const theme = useTheme();
  const { colors } = theme;

  // Feed our tokens into the navigation theme so headers/backgrounds match.
  const navTheme = useMemo<NavTheme>(() => {
    const base = theme.dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [theme, colors]);

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily, fontWeight: '800', fontSize: 20 },
          headerTintColor: colors.text,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="daily" options={{ title: t.daily.title }} />
        <Stack.Screen name="categories" options={{ title: t.categories.title }} />
        {/* No swipe-back mid-game: leaving must be an explicit choice. */}
        <Stack.Screen name="game" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="leaderboard" options={{ title: t.leaderboard.title }} />
        <Stack.Screen name="settings" options={{ title: t.settings.title }} />
        <Stack.Screen name="profile" options={{ title: t.profile.title, presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
