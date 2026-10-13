import { AD_REWARD, showRewardedAd } from '@/lib/ads';
import { useProgressStore } from '@/stores/progressStore';
import { useShopStore } from '@/stores/shopStore';

/** Plays a rewarded ad and credits the coins if it was watched to the end. */
export async function watchAdForCoins(): Promise<'earned' | 'skipped' | 'limit' | 'unavailable'> {
  const shop = useShopStore.getState();
  if (shop.watchesLeft(AD_REWARD.perDay) <= 0) return 'limit';
  const result = await showRewardedAd();
  if (result !== 'earned') return result;
  shop.countWatch();
  useProgressStore.getState().addCoins(AD_REWARD.coins);
  return 'earned';
}
