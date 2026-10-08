# سؤال · Su2al

A free Arabic general-knowledge trivia game for Android (iOS later from the same codebase).
Built with Expo SDK 57, Expo Router, TypeScript (strict), Zustand + MMKV, and Reanimated.

> **Status:** Phase 1: project skeleton, RTL, fonts, theme, navigation, placeholder screens.

## Project structure

```
app/                 Expo Router routes (each file is a screen)
  _layout.tsx        Root: RTL, splash, theme, native stack
  index.tsx          Home
  daily.tsx          Daily Challenge intro
  categories.tsx     Category grid
  game.tsx           Game (placeholder until phase 2)
  result.tsx         Result
  leaderboard.tsx    Leaderboard
  settings.tsx       Settings (theme / sound / haptics, persisted)
src/
  components/        Reusable UI (AppText, AppButton, Card, Screen…)
  services/          Supabase, ads, IAP, analytics (later phases)
  stores/            Zustand stores persisted to MMKV
  theme/             Design tokens (colors, spacing, type) + provider
  lib/               Strings, categories, storage, RTL helpers
assets/fonts/        Tajawal (OFL), embedded at build time
```

## Prerequisites

- Node.js 20+ (22 LTS recommended)
- An Android phone with **Developer options → USB debugging** turned on
- **Either** Android Studio (SDK + platform tools, `adb` on PATH) to build locally,
  **or** a free [Expo account](https://expo.dev/signup) to build in the cloud with EAS

This app uses native modules (MMKV now; AdMob, IAP and Firebase later), so it
**does not run in Expo Go**. You run it in a *development build* (your own
debug version of the app that includes expo-dev-client).

## Setup

```bash
npm install
cp .env.example .env     # values are only needed from phase 3 on
```

## Run on a physical Android phone

### Option A: local build (Android Studio installed)

```bash
# Plug in the phone via USB and accept the debugging prompt, then:
adb devices              # your phone should be listed
npm run android          # = expo run:android: prebuilds, compiles, installs, starts Metro
```

After the first install you only need `npm start` and then open the app on the
phone. Rebuild with `npm run android` only when you add a native library or
change `app.json` plugins.

### Option B: cloud build with EAS (no Android Studio)

```bash
npm install -g eas-cli
eas login
eas init                                  # links the project to your Expo account
eas build --profile development --platform android
```

When the build finishes, open the link or scan the QR code on your phone to
install the APK. Then on your computer:

```bash
npm start                                 # starts Metro for the dev client
```

Open the **سؤال** app on the phone and it connects to Metro (same Wi-Fi as your
computer, or scan the QR code shown in the terminal).

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start Metro for the development build |
| `npm run android` | Build and install the debug app on a connected device |
| `npm run android:release` | Build a local release variant (performance testing) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (eslint-config-expo) |
| `npm run doctor` | `expo-doctor` dependency check |

## Notes on RTL and fonts

- RTL is forced **natively** through the `expo-localization` config plugin
  (`forcesRTL: true` in `app.json`), so the very first launch is already
  right-to-left. `src/lib/rtl.ts` adds a JS safety net.
- Tajawal is embedded by the `expo-font` config plugin as one font family with
  weights 400/500/700/800. Use `fontFamily: 'Tajawal'` plus `fontWeight`
  (the `AppText` component does this for you).
- Both are native config: after changing them, rebuild the dev client.

## Theming

All colors, spacing, radii and type sizes live in `src/theme/tokens.ts`.
Components read them via `useTheme()`. The user picks Auto / Light / Dark in
Settings; the choice persists in MMKV.
