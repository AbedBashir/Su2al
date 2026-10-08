import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { IconName } from '@/lib/categories';

export type { IconName };

export function Icon({ name, size = 24, color }: { name: IconName; size?: number; color: string }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

/** Preloaded in the root layout so icons never pop in after the splash screen. */
export const iconFonts = MaterialCommunityIcons.font;
