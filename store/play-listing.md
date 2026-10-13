# Google Play listing — سؤال (Su2al)

Everything Play Console asks for, in the order it asks. Copy-paste ready.
Default language: **Arabic – ar**. Add **English (United States) – en-US** as a translation.

## Create app

| Field | Value |
|---|---|
| App name | `سؤال - Su2al` |
| Default language | Arabic – ar |
| App or game | **Game** |
| Free or paid | **Free** |
| Package (from the .aab) | `com.su2al.app` |

## Main store listing — Arabic (default)

**App name** (30 max): `سؤال: تحدي المعلومات العامة` (26)

**Short description** (80 max):
`تحدٍّ يومي بعشرة أسئلة، ألف سؤال في ١٠ فئات، ولوحة متصدرين لكل الدول العربية` (77)

**Full description** (4000 max):

```
سؤال هي لعبة المعلومات العامة العربية: اختبر معلوماتك كل يوم ونافس لاعبين من كل الدول العربية.

📅 تحدي اليوم
• نفس الأسئلة العشرة لكل اللاعبين في كل الدول العربية
• محاولة واحدة فقط في اليوم، والأسرع والأدق يتصدّر
• حافظ على سلسلتك اليومية 🔥

🏆 لوحة المتصدرين
• ترتيب يومي وترتيب على مر الأيام
• اختر اسمك وعلم بلدك، ونافس من المحيط إلى الخليج
• لا حساب ولا بريد إلكتروني: اسم مستعار وعلم فقط

📚 أكثر من ١٠٠٠ سؤال في ١٠ فئات
تاريخ • جغرافيا • علوم • رياضة • لغة وأدب • ثقافة إسلامية • فنون وترفيه • تكنولوجيا • طبيعة وحيوان • معلومات عامة
• أسئلة من السهل إلى الصعب
• جولات لا تنتهي في فئتك المفضّلة، مع أسئلة جديدة قبل المكرّرة

❤️ ثلاث محاولات وفرصة ثانية
• في جولات الفئات لديك ٣ قلوب
• خسرتها؟ شاهد إعلانًا قصيرًا وأكمل بقلبين

💡 وسائل مساعدة
• حذف إجابتين (٥٠:٥٠)، وقت إضافي، تخطّي السؤال
• تلميح مجاني بمشاهدة إعلان
• اربح العملات بكل إجابة صحيحة

📤 شارك نتيجتك
• صورة جاهزة بنتيجتك تتحدّى بها أصدقاءك على واتساب وإنستغرام

✨ مصمّمة للعربية
• واجهة عربية بالكامل من اليمين لليسار
• وضع فاتح وداكن، ومؤثرات صوتية واهتزاز

اللعبة مجانية وتعرض إعلانات. يمكنك إزالة الإعلانات بشراء واحد داخل التطبيق.

سياسة الخصوصية: https://su2al.abedbashir.com/privacy
للتواصل: spendshot.app@gmail.com
```

## Main store listing — English (en-US translation)

**App name** (30 max): `Su2al: Arabic Trivia Quiz` (25)

**Short description** (80 max):
`Daily 10-question challenge, 1,000+ Arabic trivia questions, Arab leaderboard` (77)

**Full description**:

```
Su2al (سؤال, "question") is the Arabic trivia game: test what you know every day and compete with players from every Arab country. The game is fully in Arabic.

DAILY CHALLENGE
• The same 10 questions for every player across the Arab world
• One attempt per day; the most accurate and fastest top the board
• Keep your daily streak going 🔥

LEADERBOARD
• Today's ranking and an all-time ranking
• Pick a nickname and your country's flag — no account, no email

1,000+ QUESTIONS IN 10 CATEGORIES
History • Geography • Science • Sports • Language & Literature • Islamic Culture • Arts & Entertainment • Technology • Nature & Animals • General Knowledge
• Easy to hard, with unseen questions first

THREE HEARTS AND A SECOND CHANCE
• Category rounds give you 3 hearts
• Lost them? Watch a short ad and continue with 2

HELPERS
• 50:50, extra time, skip — paid with coins you earn
• A free hint for watching an ad

SHARE YOUR SCORE
• A ready-made image of your result to challenge friends

Free with ads. Remove ads with a one-time in-app purchase.

Privacy policy: https://su2al.abedbashir.com/privacy
Contact: spendshot.app@gmail.com
```

## Graphics (files in this folder)

| Asset | File | Play requirement |
|---|---|---|
| App icon | `play-icon-512.png` | 512×512 PNG |
| Feature graphic | `feature-graphic-1024x500.png` | 1024×500 |
| Phone screenshots (upload in this order) | `screenshots/01-…png` … | 2–8, 9:16 |

Use the same images for both languages (the game is Arabic-only).

## App details

| Field | Value |
|---|---|
| App category | **Game → Trivia** |
| Tags | Trivia, Quiz, Word/Knowledge, Casual |
| Contact email | spendshot.app@gmail.com |
| Website | https://su2al.abedbashir.com |
| Privacy policy | https://su2al.abedbashir.com/privacy |

## In-app product (Monetize → Products → In-app products)

| Product ID | Name | Price | Type |
|---|---|---|---|
| `su2al_remove_ads` | إزالة الإعلانات (Remove ads) | **$2.99** (Play converts to local prices) | One-time, non-consumable |

Then in RevenueCat: add the Play app (`com.su2al.app`), entitlement **`no_ads`** attached to `su2al_remove_ads`, and put the public Android SDK key in `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` before building the .aab. Until then the "remove ads" card stays hidden and everything else works.

## App content (Policy → App content)

**Ads:** Yes, the app contains ads.

**In-app purchases:** Yes (one-time "remove ads").

**Target audience:** **13–15, 16–17, 18 and over**. Do **not** pick any under-13 group (that brings in the Families policy and needs child-safe ad settings).
"Could the app unintentionally appeal to children?" → No (text trivia with general and religious questions, no characters or child-directed design).

**Content rating questionnaire:** Category **Game → Trivia/Quiz**. Violence, sexuality, language, drugs: **No**. Gambling: **No** (coins can't be bought or cashed out). Users interact: **No** — only a nickname and flag on a leaderboard, no chat or messages. Shares location: **No**. Digital purchases: **Yes**.
Expected rating: **Everyone / PEGI 3**.

**Government / News / Health / Financial features:** No.

### Data safety form

Collected data is encrypted in transit: **Yes**. Users can request deletion: **Yes** — in the app (Settings → Your leaderboard profile → Delete) and via the "Delete account URL" `https://su2al.abedbashir.com/privacy#delete`. Data sold: **No**.
"Does your app collect data?" → Yes. Account creation: a leaderboard profile counts as an account → choose **Other** and describe it as *"Optional anonymous nickname, identified by a random token stored on the device; no email or password."*

| Data type | Collected | Shared | Purpose | Optional? |
|---|---|---|---|---|
| Personal info → Other info (nickname, country) | Yes | No | App functionality | Optional (only if you join the leaderboard) |
| App activity → Other actions (daily answers, scores) | Yes | No | App functionality | Optional (leaderboard) |
| App activity → App interactions | Yes | **Yes — Google AdMob** | Advertising, Analytics | Required (ads) |
| App info and performance → Diagnostics | Yes | **Yes — Google AdMob** | Advertising | Required (ads) |
| Device or other IDs (advertising ID) | Yes | **Yes — Google AdMob** | Advertising | Required unless ads removed |
| Location → Approximate location (IP, by AdMob) | Yes | **Yes — Google AdMob** | Advertising | Required (ads) |
| Financial info → Purchase history (remove-ads, via Google Play/RevenueCat) | Yes | No | App functionality | Optional |

## Release

1. Closed testing track → upload `~/Desktop/Su2al-1.0.0.aab` → add the **same 12 testers** as Spendshot (an email list can be reused across apps).
2. After **14 days** with 12+ testers opted in: apply for production access (Dashboard), then promote the release.
3. Countries: all — or at least the 22 Arab League countries plus everywhere Arabs live (just pick "All countries").
