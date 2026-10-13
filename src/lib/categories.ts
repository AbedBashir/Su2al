import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { CategoryId } from '@/shared/quiz';

export type { CategoryId };

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Category = {
  id: CategoryId;
  nameAr: string;
  icon: IconName;
  /** Card tint; readable white text sits on top of it in both themes. */
  color: string;
};

export const CATEGORIES: readonly Category[] = [
  { id: 'history', nameAr: 'تاريخ', icon: 'castle', color: '#C2410C' },
  { id: 'geography', nameAr: 'جغرافيا', icon: 'earth', color: '#0F766E' },
  { id: 'science', nameAr: 'علوم', icon: 'flask', color: '#2563EB' },
  { id: 'sports', nameAr: 'رياضة', icon: 'soccer', color: '#15803D' },
  { id: 'language', nameAr: 'لغة وأدب', icon: 'book-open-variant', color: '#9333EA' },
  { id: 'religion', nameAr: 'ثقافة إسلامية', icon: 'mosque', color: '#047857' },
  { id: 'arts', nameAr: 'فنون وترفيه', icon: 'palette', color: '#DB2777' },
  { id: 'technology', nameAr: 'تكنولوجيا', icon: 'laptop', color: '#4F46E5' },
  { id: 'nature', nameAr: 'طبيعة وحيوان', icon: 'paw', color: '#A16207' },
  { id: 'general', nameAr: 'معلومات عامة', icon: 'lightbulb-on', color: '#BE123C' },
] as const;

export function getCategory(id: string | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
