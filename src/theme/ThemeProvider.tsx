import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';
import { darkTheme, lightTheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(lightTheme);

/** Resolves the user's theme preference (system/light/dark) into concrete tokens. */
export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);

  const theme = useMemo(() => {
    const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
    return isDark ? darkTheme : lightTheme;
  }, [themeMode, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
