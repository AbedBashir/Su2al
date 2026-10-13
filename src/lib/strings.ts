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
      'بدون مساعدات، محاولة واحدة فقط',
      'العب يوميًا لتزيد سلسلتك 🔥',
    ],
    start: 'يلّا نبدأ',
    played: 'لعبت تحدي اليوم ✅',
    comeBack: 'عُد غدًا لتحدٍّ جديد',
  },
  categories: {
    title: 'اختر فئة',
    subtitle: '٣ محاولات في كل جولة من ١٠ أسئلة',
  },
  game: {
    question: 'سؤال',
    of: 'من',
    timeUp: 'انتهى الوقت!',
    correct: 'إجابة صحيحة!',
    wrong: 'إجابة خاطئة',
    skipped: 'تم التخطي',
    helpers: { fifty: '٥٠:٥٠', time: '+١٠ ثوانٍ', skip: 'تخطٍّ' },
    notEnoughCoins: 'لا تملك عملات كافية',
    notEnoughCoinsBody: 'اربح العملات بالإجابات الصحيحة وتحدي اليوم.',
    quitTitle: 'الخروج من الجولة؟',
    quitBody: 'ستخسر تقدّمك في هذه الجولة.',
    quitDailyBody: 'لديك محاولة واحدة فقط اليوم، وستُحتسب نتيجتك الحالية.',
    quit: 'خروج',
    stay: 'متابعة اللعب',
    difficulty: { 1: 'سهل', 2: 'متوسط', 3: 'صعب' },
    optionLetters: ['أ', 'ب', 'ج', 'د'],
  },
  result: {
    title: 'النتيجة',
    score: 'النقاط',
    correct: 'إجابات صحيحة',
    coins: 'عملات ربحتها',
    streak: 'يوم متتالي',
    newBest: 'رقم قياسي جديد! 🎉',
    perfect: 'علامة كاملة! 🌟',
    outOfLives: 'نفدت المحاولات',
    playAgain: 'العب مجددًا',
    home: 'الرئيسية',
    leaderboard: 'لوحة المتصدرين',
    share: 'شارك نتيجتك',
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
