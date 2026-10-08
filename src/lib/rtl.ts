import { I18nManager } from 'react-native';

/**
 * The app is Arabic-only, so the layout must always be RTL.
 *
 * The real switch is native: the `expo-localization` config plugin in app.json
 * (`forcesRTL: true`) makes the very first launch RTL. These JS calls are a
 * safety net; on their own they only take effect after an app restart.
 */
export function ensureRTL(): void {
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    if (__DEV__) {
      console.warn('[rtl] Layout was LTR; RTL forced. Restart the app (or rebuild after `expo prebuild`).');
    }
  }
}
