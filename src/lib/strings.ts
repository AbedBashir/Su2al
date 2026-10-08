/** All user-facing Arabic copy lives here so wording stays consistent. */
export const t = {
  appName: 'سؤال',
  tagline: 'تحدَّ معلوماتك كل يوم',
  home: {
    dailyTitle: 'تحدي اليوم',
    dailySubtitle: '١٠ أسئلة • ١٥ ثانية لكل سؤال',
    dailyCta: 'ابدأ التحدي',
    categories: 'الفئات',
    categoriesSubtitle: 'جولات لا نهائية في موضوعك المفضّل',
    leaderboard: 'المتصدرون',
    settings: 'الإعدادات',
    streak: 'سلسلة',
    coins: 'عملات',
  },
  daily: {
    title: 'تحدي اليوم',
    rules: [
      'نفس الأسئلة العشرة لكل اللاعبين اليوم',
      '١٥ ثانية لكل سؤال',
      '١٠٠ نقطة لكل إجابة صحيحة + مكافأة السرعة',
      'العب يوميًا لتزيد سلسلتك 🔥',
    ],
    start: 'يلّا نبدأ',
  },
  categories: {
    title: 'اختر فئة',
    subtitle: '٣ محاولات في كل جولة من ١٠ أسئلة',
  },
  game: {
    title: 'اللعب',
    placeholder: 'شاشة اللعب ستُبنى في المرحلة الثانية',
    finish: 'إنهاء (تجريبي)',
  },
  result: {
    title: 'النتيجة',
    score: 'النقاط',
    playAgain: 'العب مجددًا',
    home: 'الرئيسية',
  },
  leaderboard: {
    title: 'المتصدرون اليوم',
    empty: 'ستظهر لوحة المتصدرين بعد ربط الخادم في المرحلة الثالثة',
  },
  settings: {
    title: 'الإعدادات',
    appearance: 'المظهر',
    themeSystem: 'تلقائي',
    themeLight: 'فاتح',
    themeDark: 'داكن',
    sound: 'المؤثرات الصوتية',
    haptics: 'الاهتزاز',
    version: 'الإصدار',
  },
  common: {
    back: 'رجوع',
  },
} as const;

/** Formats a number with Arabic-Indic digits (٠١٢٣…). */
export function formatNumber(n: number): string {
  return n.toLocaleString('ar-EG');
}
