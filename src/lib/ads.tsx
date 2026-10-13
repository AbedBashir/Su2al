import Constants, { ExecutionEnvironment } from 'expo-constants';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { useShopStore } from '@/stores/shopStore';

// Google Mobile Ads is a native module: it doesn't exist in Expo Go, so everything
// here loads lazily and quietly does nothing there.
type AdsModule = typeof import('react-native-google-mobile-ads');

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let mod: AdsModule | null = null;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: absent in Expo Go
    mod = require('react-native-google-mobile-ads') as AdsModule;
  } catch {
    mod = null;
  }
}

// Production ad units from AdMob (not secret: they ship inside the app). Development
// and preview builds always use Google's test units, because tapping your own live
// ads can get the AdMob account suspended.
type Units = { banner?: string; interstitial?: string; rewarded?: string };
const LIVE_UNITS: { android: Units; ios: Units } = {
  android: {
    banner: 'ca-app-pub-8824433754085561/8731423097',
    interstitial: 'ca-app-pub-8824433754085561/3300142178',
    rewarded: 'ca-app-pub-8824433754085561/9231870565',
  },
  ios: {
    banner: 'ca-app-pub-8824433754085561/7998679945',
    interstitial: 'ca-app-pub-8824433754085561/2904381341',
    rewarded: 'ca-app-pub-8824433754085561/6652054660',
  },
};
const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_APP_VARIANT === 'preview';
const UNITS: Units = useTestAds
  ? { banner: mod?.TestIds.ADAPTIVE_BANNER, interstitial: mod?.TestIds.INTERSTITIAL, rewarded: mod?.TestIds.REWARDED }
  : Platform.OS === 'ios'
    ? LIVE_UNITS.ios
    : LIVE_UNITS.android;

/** Coins for watching a rewarded ad (matches the AdMob reward setting), and how often per day. */
export const AD_REWARD = { coins: 30, perDay: 5 } as const;

let ready: Promise<boolean> | null = null;
let personalized = false;

/**
 * Asks for consent where the law requires it (EEA/UK), then Apple's tracking prompt on
 * iOS, then starts the SDK. Ads are personalized only when both allow it.
 */
export function initAds(): Promise<boolean> {
  if (!mod) return Promise.resolve(false);
  if (!ready) {
    const m = mod;
    ready = (async () => {
      try {
        // If the consent check itself fails (offline, or no consent form set up for this
        // app), fall back to the status already known; outside Europe that allows ads.
        const info = await m.AdsConsent.gatherConsent().catch(() => m.AdsConsent.getConsentInfo());
        if (!info.canRequestAds) return false;
        const choices = await m.AdsConsent.getUserChoices().catch(() => null);
        const tracking = Platform.OS === 'ios' ? (await requestTrackingPermissionsAsync().catch(() => null))?.granted : true;
        personalized = !!choices?.selectPersonalisedAds && !!tracking;
        await m.default().initialize();
        return true;
      } catch {
        return false;
      }
    })();
  }
  return ready;
}

const requestOptions = () => ({ requestNonPersonalizedAdsOnly: !personalized });
const adsRemoved = () => useShopStore.getState().adsRemoved;

const BANNER_RETRIES = 2;
const BANNER_RETRY_MS = 20_000;

/** Adaptive banner. Renders nothing when ads are unavailable or were removed. */
export function AdBanner() {
  const removed = useShopStore((s) => s.adsRemoved);
  const [ok, setOk] = useState(false);
  // Each failure remounts the banner after a pause; after the last retry it stays hidden.
  const [attempt, setAttempt] = useState(0);
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (!removed) initAds().then(setOk);
  }, [removed]);
  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(() => {
      setWaiting(false);
      setAttempt((a) => a + 1);
    }, BANNER_RETRY_MS);
    return () => clearTimeout(t);
  }, [waiting]);
  if (removed || !ok || waiting || attempt > BANNER_RETRIES || !mod || !UNITS.banner) return null;
  const { BannerAd, BannerAdSize } = mod;
  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        key={attempt}
        unitId={UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={requestOptions()}
        onAdFailedToLoad={() => (attempt < BANNER_RETRIES ? setWaiting(true) : setAttempt(BANNER_RETRIES + 1))}
      />
    </View>
  );
}

// Interstitials: after every 2nd finished round, never twice within 2 minutes.
const EVERY_N_ROUNDS = 2;
const MIN_GAP_MS = 2 * 60_000;
let rounds = 0;
let lastShown = 0;
let interstitial: ReturnType<AdsModule['InterstitialAd']['createForAdRequest']> | null = null;

function preloadInterstitial() {
  if (!mod || !UNITS.interstitial || interstitial) return;
  const ad = mod.InterstitialAd.createForAdRequest(UNITS.interstitial, requestOptions());
  ad.addAdEventListener(mod.AdEventType.CLOSED, () => {
    interstitial = null;
    preloadInterstitial();
  });
  ad.addAdEventListener(mod.AdEventType.ERROR, () => {
    interstitial = null;
  });
  ad.load();
  interstitial = ad;
}

/** Call when a round ends: shows a full-screen ad now and then. */
export async function maybeShowInterstitial() {
  if (adsRemoved() || !(await initAds())) return;
  preloadInterstitial();
  rounds += 1;
  if (rounds % EVERY_N_ROUNDS !== 0 || Date.now() - lastShown < MIN_GAP_MS) return;
  if (interstitial?.loaded) {
    lastShown = Date.now();
    await interstitial.show().catch(() => {});
  }
}

/** Warm up ads early so they're ready when needed. Rewarded ads stay available to everyone. */
export function prepareAds() {
  void initAds().then((ok) => {
    if (!ok) return;
    preloadRewarded();
    if (!adsRemoved()) preloadInterstitial();
  });
}

/** Lets EEA/UK users revisit their ad-privacy choices (must be reachable from settings). */
export async function showAdPrivacyOptions() {
  if (!mod) return false;
  const info = await mod.AdsConsent.requestInfoUpdate().catch(() => null);
  if (info?.privacyOptionsRequirementStatus !== mod.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED) return false;
  await mod.AdsConsent.showPrivacyOptionsForm();
  return true;
}

export const adsAvailable = () => !!mod;
export const rewardedAvailable = () => !!mod && !!UNITS.rewarded;

const REWARDED_LOAD_TIMEOUT_MS = 20_000;

type Rewarded = ReturnType<AdsModule['RewardedAd']['createForAdRequest']>;
// One rewarded ad is kept loaded in the background, so hints and the second chance
// start instantly instead of making the player wait for a download.
let nextRewarded: Rewarded | null = null;

function preloadRewarded() {
  if (!mod || !UNITS.rewarded || nextRewarded) return;
  const ad = mod.RewardedAd.createForAdRequest(UNITS.rewarded, requestOptions());
  const off = ad.addAdEventListener(mod.AdEventType.ERROR, () => {
    off();
    if (nextRewarded === ad) nextRewarded = null;
  });
  ad.load();
  nextRewarded = ad;
}

/** Shows an ad that's already loaded, or loads one (up to 20s). Resolves to the ad, or null. */
async function readyRewarded(m: AdsModule): Promise<Rewarded | null> {
  const ad = nextRewarded;
  nextRewarded = null;
  if (ad?.loaded) return ad;
  const fresh = ad ?? m.RewardedAd.createForAdRequest(UNITS.rewarded!, requestOptions());
  return new Promise((resolve) => {
    const timeout = setTimeout(() => done(null), REWARDED_LOAD_TIMEOUT_MS);
    const unsubs = [
      fresh.addAdEventListener(m.RewardedAdEventType.LOADED, () => done(fresh)),
      fresh.addAdEventListener(m.AdEventType.ERROR, () => done(null)),
    ];
    function done(v: Rewarded | null) {
      clearTimeout(timeout);
      unsubs.forEach((u) => u());
      resolve(v);
    }
    if (!ad) fresh.load();
  });
}

/**
 * Shows a rewarded ad. Resolves true only if the player watched long enough to earn
 * the reward; false if they closed early or no ad was available.
 * (Players who removed ads can still choose to watch one for a reward.)
 */
/** `skipped`: the ad played but was closed before the reward; `unavailable`: no ad could be shown. */
export type RewardedResult = 'earned' | 'skipped' | 'unavailable';

export async function showRewardedAd(): Promise<RewardedResult> {
  if (!mod || !UNITS.rewarded || !(await initAds())) return 'unavailable';
  const m = mod;
  const ad = await readyRewarded(m);
  if (!ad) {
    preloadRewarded();
    return 'unavailable';
  }
  return new Promise<RewardedResult>((resolve) => {
    let earned = false;
    const unsubs = [
      ad.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
      ad.addAdEventListener(m.AdEventType.CLOSED, () => finish(earned ? 'earned' : 'skipped')),
      ad.addAdEventListener(m.AdEventType.ERROR, () => finish('unavailable')),
    ];
    function finish(v: RewardedResult) {
      unsubs.forEach((u) => u());
      preloadRewarded(); // get the next one ready
      resolve(v);
    }
    ad.show().catch(() => finish('unavailable'));
  });
}
