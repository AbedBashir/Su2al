/** Privacy policy served at /privacy (linked from the stores, AdMob and the app). */
const CONTACT = 'spendshot.app@gmail.com';
const UPDATED = '2026-10-13';

export const privacyHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>سؤال · سياسة الخصوصية | Su2al Privacy Policy</title>
<style>
  :root { color-scheme: light dark; --bg: #f7f5ff; --fg: #1d1a2e; --muted: #5f5a78; --accent: #6c3ce1; --card: #fff; }
  @media (prefers-color-scheme: dark) { :root { --bg: #14121f; --fg: #eeeaff; --muted: #a9a3c7; --accent: #a98bff; --card: #1e1b2e; } }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.7 system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 24px 16px 48px; }
  section { background: var(--card); border-radius: 16px; padding: 8px 20px 16px; margin-bottom: 20px; }
  h1 { color: var(--accent); margin: 8px 0 0; }
  h2 { font-size: 1.1rem; margin: 20px 0 4px; }
  p, li { color: var(--fg); }
  .muted { color: var(--muted); font-size: .9rem; }
  a { color: var(--accent); }
  [dir="ltr"] { text-align: left; }
</style>
</head>
<body>
<main>
<section>
  <h1>سؤال · سياسة الخصوصية</h1>
  <p class="muted">آخر تحديث: ${UPDATED}</p>
  <p>«سؤال» لعبة أسئلة ومعلومات عامة. توضح هذه الصفحة ما تجمعه اللعبة من بيانات ولماذا ومع من تُشارك. للتواصل: <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>
  <h2>ما نجمعه</h2>
  <ul>
    <li><b>على جهازك فقط:</b> تقدّمك، العملات، السلسلة اليومية والإعدادات. لا تغادر هاتفك.</li>
    <li><b>لوحة المتصدرين (اختيارية):</b> إذا انضممت، نحفظ على خادمنا اسمًا مستعارًا تختاره، ودولتك، ونتائج التحدي اليومي وإجاباتك عليه (للتحقق من النتيجة)، ومعرّفًا عشوائيًا لجهازك. الاسم والدولة والنتيجة تظهر للجميع في اللوحة. لا نطلب بريدًا إلكترونيًا ولا رقم هاتف ولا حسابًا.</li>
    <li><b>الإعلانات:</b> نعرض إعلانات من Google AdMob، وقد تستخدم معرّف الإعلانات في جهازك وعنوان IP ومعلومات الجهاز لعرض الإعلانات وقياسها. في أوروبا والمملكة المتحدة نطلب موافقتك أولًا، وعلى iPhone يطلب النظام إذنك للتتبّع. يمكنك تغيير اختيارك من الإعدادات ← خيارات خصوصية الإعلانات. <a href="https://policies.google.com/technologies/partner-sites">كيف تستخدم Google البيانات</a>.</li>
    <li><b>المشتريات:</b> شراء «إزالة الإعلانات» يتم عبر Google Play أو App Store، ونستخدم RevenueCat للتحقق منه بمعرّف مجهول. لا نرى بيانات الدفع.</li>
  </ul>
  <h2>الحذف</h2>
  <p>حذف التطبيق يمسح كل ما على جهازك. لحذف اسمك ونتائجك من لوحة المتصدرين، راسلنا على <a href="mailto:${CONTACT}">${CONTACT}</a> مع اسمك المستعار ودولتك، ونحذفها خلال ٣٠ يومًا.</p>
  <h2>الأطفال</h2>
  <p>اللعبة غير موجهة للأطفال دون ١٣ عامًا، ولا نجمع عن قصد بيانات منهم.</p>
  <h2>الأمان والتغييرات</h2>
  <p>البيانات تنتقل عبر اتصال مشفّر (HTTPS). إذا غيّرنا هذه السياسة نحدّث التاريخ أعلاه.</p>
</section>

<section dir="ltr">
  <h1>Su2al · Privacy Policy</h1>
  <p class="muted">Last updated: ${UPDATED}</p>
  <p>Su2al is a general-knowledge trivia game. This page explains what data the game collects, why, and who it is shared with. Contact: <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>
  <h2>What we collect</h2>
  <ul>
    <li><b>On your device only:</b> your progress, coins, daily streak and settings. They never leave your phone.</li>
    <li><b>Leaderboard (optional):</b> if you join, our server stores the nickname you choose, your country, your daily challenge results and answers (to verify the score), and a random ID for your device. Nickname, country and score are shown publicly on the leaderboard. We never ask for an email, phone number or account.</li>
    <li><b>Ads:</b> we show ads from Google AdMob, which may use your device's advertising ID, IP address and device information to serve and measure ads. In the EEA, UK and Switzerland we ask for your consent first, and on iPhone the system asks for tracking permission. You can change your choice under Settings → Ad privacy options. <a href="https://policies.google.com/technologies/partner-sites">How Google uses data</a>.</li>
    <li><b>Purchases:</b> "Remove ads" is bought through Google Play or the App Store; we use RevenueCat to verify it with an anonymous ID. We never see your payment details.</li>
  </ul>
  <h2>Deletion</h2>
  <p>Uninstalling the app erases everything on your device. To remove your nickname and scores from the leaderboard, email <a href="mailto:${CONTACT}">${CONTACT}</a> with your nickname and country, and we delete them within 30 days.</p>
  <h2>Children</h2>
  <p>The game is not directed at children under 13, and we do not knowingly collect their data.</p>
  <h2>Security and changes</h2>
  <p>Data travels over encrypted connections (HTTPS). If this policy changes, we update the date above.</p>
</section>
</main>
</body>
</html>`;
