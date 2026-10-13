/** The 22 Arab League members, then "other" for players anywhere else. */
export const COUNTRIES = [
  { code: 'LB', nameAr: 'لبنان' },
  { code: 'SA', nameAr: 'السعودية' },
  { code: 'EG', nameAr: 'مصر' },
  { code: 'AE', nameAr: 'الإمارات' },
  { code: 'JO', nameAr: 'الأردن' },
  { code: 'SY', nameAr: 'سوريا' },
  { code: 'IQ', nameAr: 'العراق' },
  { code: 'PS', nameAr: 'فلسطين' },
  { code: 'KW', nameAr: 'الكويت' },
  { code: 'QA', nameAr: 'قطر' },
  { code: 'BH', nameAr: 'البحرين' },
  { code: 'OM', nameAr: 'عُمان' },
  { code: 'YE', nameAr: 'اليمن' },
  { code: 'MA', nameAr: 'المغرب' },
  { code: 'DZ', nameAr: 'الجزائر' },
  { code: 'TN', nameAr: 'تونس' },
  { code: 'LY', nameAr: 'ليبيا' },
  { code: 'SD', nameAr: 'السودان' },
  { code: 'MR', nameAr: 'موريتانيا' },
  { code: 'SO', nameAr: 'الصومال' },
  { code: 'DJ', nameAr: 'جيبوتي' },
  { code: 'KM', nameAr: 'جزر القمر' },
  { code: 'ZZ', nameAr: 'دولة أخرى' },
] as const;

/** Emoji flag from an ISO country code; a globe for "other". */
export function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code) || code === 'ZZ') return '🌍';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
