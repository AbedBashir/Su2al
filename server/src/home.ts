/** Landing page at /: the address printed on shared result images. */
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.su2al.app';

export const homeHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>سؤال · تحدَّ معلوماتك كل يوم</title>
<meta name="description" content="لعبة أسئلة ومعلومات عامة بالعربية: تحدٍّ يومي، عشر فئات، ولوحة متصدرين لكل الدول العربية.">
<meta property="og:title" content="سؤال · تحدَّ معلوماتك كل يوم">
<meta property="og:description" content="تحدٍّ يومي، عشر فئات، ولوحة متصدرين لكل الدول العربية.">
<style>
  :root { --bg: #6c3ce9; --deep: #5527c9; --fg: #fff; --soft: #ede6ff; --amber: #ffc53d; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at 80% 0%, #7c4dff, var(--bg) 45%, var(--deep)); color: var(--fg); font: 17px/1.7 system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif; text-align: center; padding: 32px 16px; }
  main { max-width: 520px; }
  h1 { font-size: 64px; margin: 0; line-height: 1.2; }
  .tag { color: var(--soft); font-size: 20px; margin: 4px 0 28px; }
  ul { list-style: none; padding: 0; margin: 0 0 32px; display: grid; gap: 10px; }
  li { background: rgba(255,255,255,.12); border-radius: 14px; padding: 12px 16px; }
  .btn { display: inline-block; background: var(--amber); color: #1c1433; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 16px; font-size: 18px; }
  .soon { display: block; margin-top: 12px; color: var(--soft); font-size: 14px; }
  footer { margin-top: 40px; font-size: 14px; }
  footer a { color: var(--soft); }
</style>
</head>
<body>
<main>
  <h1>سؤال</h1>
  <p class="tag">تحدَّ معلوماتك كل يوم</p>
  <ul>
    <li>📅 تحدي يومي: نفس الأسئلة العشرة لكل اللاعبين</li>
    <li>🏆 لوحة متصدرين لكل الدول العربية</li>
    <li>📚 أكثر من ألف سؤال في عشر فئات</li>
  </ul>
  <a class="btn" href="${PLAY_URL}">حمّل اللعبة من Google Play</a>
  <span class="soon">قريبًا على iPhone</span>
  <footer><a href="/privacy">سياسة الخصوصية · Privacy</a></footer>
</main>
</body>
</html>`;
