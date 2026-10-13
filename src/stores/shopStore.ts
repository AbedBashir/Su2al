import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesStoreProduct } from 'react-native-purchases';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';
import { dayKey } from '@/shared/quiz';

// "Remove ads" is a one-time purchase sold through RevenueCat (which wraps Google Play
// Billing and StoreKit). Store setup: a non-consumable product `su2al_remove_ads`
// ($2.99) granting the RevenueCat entitlement `no_ads`. Until the keys exist the
// purchase button says "coming soon" and nothing else changes.
export const REMOVE_ADS = { productId: 'su2al_remove_ads', entitlement: 'no_ads', fallbackPrice: '$2.99' } as const;

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});
export const storeConfigured = !!API_KEY;

const owns = (info: CustomerInfo) => !!info.entitlements.active[REMOVE_ADS.entitlement];

type ShopState = {
  /** Remembered on the phone so ads stay off offline; refreshed from the store on launch. */
  adsRemoved: boolean;
  /** Rewarded ads watched today, for the daily cap. */
  adWatches: { day: string; count: number };
  product: PurchasesStoreProduct | null;

  init: () => Promise<void>;
  buyRemoveAds: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  watchesLeft: (perDay: number) => number;
  countWatch: () => void;
};

let configured = false;

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      adsRemoved: false,
      adWatches: { day: '', count: 0 },
      product: null,

      init: async () => {
        if (!API_KEY) return;
        try {
          if (!configured) {
            Purchases.configure({ apiKey: API_KEY });
            configured = true;
            Purchases.addCustomerInfoUpdateListener((info) => set({ adsRemoved: owns(info) || get().adsRemoved }));
          }
          const [info, products] = await Promise.all([Purchases.getCustomerInfo(), Purchases.getProducts([REMOVE_ADS.productId])]);
          set({ adsRemoved: owns(info), product: products[0] ?? null });
        } catch {
          // Offline or store not set up yet: keep what we remembered.
        }
      },
      buyRemoveAds: async () => {
        const product = get().product;
        if (!API_KEY || !product) return false;
        try {
          const { customerInfo } = await Purchases.purchaseStoreProduct(product);
          const ok = owns(customerInfo);
          if (ok) set({ adsRemoved: true });
          return ok;
        } catch (e) {
          if ((e as { userCancelled?: boolean }).userCancelled) return false;
          throw e;
        }
      },
      restore: async () => {
        if (!API_KEY) return false;
        const ok = owns(await Purchases.restorePurchases());
        set({ adsRemoved: ok });
        return ok;
      },
      watchesLeft: (perDay) => {
        const { day, count } = get().adWatches;
        return day === dayKey() ? Math.max(0, perDay - count) : perDay;
      },
      countWatch: () => {
        const today = dayKey();
        const { day, count } = get().adWatches;
        set({ adWatches: { day: today, count: day === today ? count + 1 : 1 } });
      },
    }),
    {
      name: 'shop',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      // The product object is fetched fresh each launch.
      partialize: ({ adsRemoved, adWatches }) => ({ adsRemoved, adWatches }),
    },
  ),
);
