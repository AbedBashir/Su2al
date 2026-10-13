import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RoundSummary } from '@/game/summary';
import { getCategory } from '@/lib/categories';
import { formatNumber, t } from '@/lib/strings';
import { fontFamily, palette } from '@/theme';

/** Where the image sends people; the site forwards to the right store. */
export const SHARE_SITE = 'su2al.abedbashir.com';

/** One square per question, like the result grid people already know from word games. */
export const resultSquares = (results: RoundSummary['results']) =>
  (results ?? []).map((r) => (r === 'correct' ? '🟩' : r === 'skipped' ? '⬜' : '🟥')).join('');

/**
 * The image players share after a round. Always the brand colours (it's seen outside
 * the app, whatever theme the player uses) and laid out for a square feed post.
 */
export const ShareCard = forwardRef<View, { round: RoundSummary }>(function ShareCard({ round }, ref) {
  const title = round.mode === 'daily' ? t.share.daily : (getCategory(round.category)?.nameAr ?? t.result.title);
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <Text style={[styles.text, styles.logo]}>سؤال</Text>
      <Text style={[styles.text, styles.title]}>
        {title}
        {round.day ? ` · ${round.day}` : ''}
      </Text>

      <View style={styles.scoreBox}>
        <Text style={[styles.text, styles.scoreLabel]}>{t.result.score}</Text>
        <Text style={[styles.text, styles.score]}>{formatNumber(round.score)}</Text>
        <Text style={[styles.text, styles.correct]}>
          {formatNumber(round.correct)} {t.game.of} {formatNumber(round.total)} {t.share.correct}
          {round.streak && round.streak > 1 ? `  ·  🔥 ${formatNumber(round.streak)}` : ''}
        </Text>
      </View>

      {round.results?.length ? <Text style={styles.squares}>{resultSquares(round.results)}</Text> : null}

      <Text style={[styles.text, styles.challenge]}>{t.share.challenge}</Text>
      <Text style={[styles.text, styles.site]}>{SHARE_SITE}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 360,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.violet600,
    overflow: 'hidden',
  },
  glowTop: { position: 'absolute', top: -120, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: palette.violet500 },
  glowBottom: { position: 'absolute', bottom: -140, left: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: palette.violet700 },
  text: { fontFamily, color: palette.white, textAlign: 'center', writingDirection: 'rtl' },
  logo: { fontSize: 34, lineHeight: 46, fontWeight: '800' },
  title: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: palette.violet100 },
  scoreBox: { alignItems: 'center', backgroundColor: palette.white, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 28 },
  scoreLabel: { fontSize: 13, lineHeight: 18, color: palette.gray500 },
  score: { fontSize: 44, lineHeight: 60, fontWeight: '800', color: palette.violet600 },
  correct: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: palette.ink900 },
  squares: { fontSize: 18, lineHeight: 26, letterSpacing: 2 },
  challenge: { fontSize: 17, lineHeight: 24, fontWeight: '700', color: palette.amber400 },
  site: { fontSize: 13, lineHeight: 18, color: palette.violet100 },
});
