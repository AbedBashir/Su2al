import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppText, Card, Icon, PressableScale, Screen, StatChip } from '@/components';
import { watchAdForCoins } from '@/game/rewards';
import { setLastRound, type RoundSummary } from '@/game/summary';
import { HELPERS, RULES, useGame, type Answer, type Helper, type Mode } from '@/game/useGame';
import { getCategory, type CategoryId } from '@/lib/categories';
import { categoryQuestions, dailyQuestions, dayKey, type Question } from '@/shared/quiz';
import { formatNumber, t } from '@/lib/strings';
import { usePlayerStore } from '@/stores/playerStore';
import { useProgressStore } from '@/stores/progressStore';
import { useTheme } from '@/theme';

type Params = { mode?: Mode; category?: CategoryId };

export default function GameScreen() {
  const { mode = 'daily', category = 'general' } = useLocalSearchParams<Params>();
  // Picked once per mount: a round's questions (and its day) never change mid-game,
  // even if midnight passes while playing.
  const [day] = useState(dayKey);
  const [questions] = useState<Question[]>(() =>
    mode === 'daily' ? dailyQuestions(day) : categoryQuestions(category, useProgressStore.getState().seen[category] ?? []),
  );
  const game = useGame(mode, questions);
  const { state, question, msLeft } = game;
  const finished = useRef(false);

  // Saves progress and coins, then shows the result. Runs once per round.
  const finish = (answers: Answer[], score: number, outOfLives: boolean) => {
    if (finished.current) return;
    finished.current = true;
    const progress = useProgressStore.getState();
    const correct = answers.filter((a) => a.correct).length;
    const total = questions.length;
    const summary: RoundSummary = { mode, score, correct, total, coins: correct * RULES.coinsPerCorrect, outOfLives };
    if (mode === 'daily') {
      summary.coins += 10 + (correct === total ? 10 : 0); // finishing the daily is worth it
      summary.streak = progress.finishDaily({ score, correct, total }, day).streak;
      summary.day = day;
      // The server re-scores the round from these answers; sent now or when back online.
      const player = usePlayerStore.getState();
      player.queueDaily({ day, answers: answers.map(({ id, choice, ms }) => ({ id, choice, ms })) });
      void player.flush();
    } else {
      summary.category = category;
      progress.markSeen(category, answers.map((a) => a.id));
      summary.best = progress.finishCategory(category, score, correct).best;
    }
    progress.addCoins(summary.coins);
    setLastRound(summary);
    router.replace('/result');
  };

  useEffect(() => {
    if (state.phase === 'done') finish(state.answers, state.score, mode === 'category' && state.lives <= 0);
  });

  // Leaving mid-round must be deliberate. In the daily challenge it ends today's attempt,
  // so the questions can't be looked at and replayed later.
  const confirmQuit = () => {
    Alert.alert(t.game.quitTitle, mode === 'daily' ? t.game.quitDailyBody : t.game.quitBody, [
      { text: t.game.stay, style: 'cancel' },
      {
        text: t.game.quit,
        style: 'destructive',
        onPress: () => (mode === 'daily' ? finish(state.answers, state.score, false) : router.back()),
      },
    ]);
    return true;
  };
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', confirmQuit);
    return () => sub.remove();
  });

  if (!question) return null;
  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar
        index={state.index}
        total={questions.length}
        lives={mode === 'category' ? state.lives : undefined}
        score={state.score}
        onClose={confirmQuit}
      />
      <TimerBar msLeft={msLeft} revealing={state.phase !== 'question'} />

      <Animated.View key={question.id} entering={FadeInDown.duration(300)} style={styles.flex}>
        <QuestionCard question={question} showDifficulty={mode === 'daily'} />
        <View style={{ gap: 10, marginTop: 16 }}>
          {question.options.map((option, i) => (
            <OptionButton
              key={`${question.id}-${i}`}
              index={i}
              label={option}
              status={optionStatus(i, question, state.phase, state.picked, state.hidden)}
              onPress={() => game.pick(i)}
            />
          ))}
        </View>
        <Feedback phase={state.phase} answer={state.answers[state.answers.length - 1]} questionId={question.id} />
      </Animated.View>

      {mode === 'category' ? (
        <Helpers disabled={state.phase !== 'question'} fiftyUsed={state.hidden.length > 0} apply={game.applyHelper} />
      ) : null}
    </Screen>
  );
}

type OptionStatus = 'idle' | 'correct' | 'wrong' | 'dim' | 'hidden';

function optionStatus(i: number, q: Question, phase: string, picked: number | null, hidden: number[]): OptionStatus {
  if (hidden.includes(i)) return 'hidden';
  if (phase === 'question') return 'idle';
  if (i === q.answer) return 'correct';
  if (i === picked) return 'wrong';
  return 'dim';
}

function TopBar({ index, total, lives, score, onClose }: { index: number; total: number; lives?: number; score: number; onClose: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.row}>
      <PressableScale
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t.game.quit}
        style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill }]}
      >
        <Icon name="close" size={24} color={colors.text} />
      </PressableScale>
      <AppText variant="label" color="textMuted">
        {t.game.question} {formatNumber(index + 1)} {t.game.of} {formatNumber(total)}
      </AppText>
      {lives !== undefined ? (
        <View style={[styles.row, { gap: 2 }]} accessible accessibilityLabel={formatNumber(lives)}>
          {Array.from({ length: RULES.lives }, (_, i) => (
            <Icon key={i} name={i < lives ? 'heart' : 'heart-outline'} size={24} color={colors.danger} />
          ))}
        </View>
      ) : (
        <StatChip icon="star-four-points" iconColor={colors.accent} value={score} label={t.result.score} />
      )}
    </View>
  );
}

function TimerBar({ msLeft, revealing }: { msLeft: number; revealing: boolean }) {
  const { colors, radius } = useTheme();
  const fraction = revealing ? 0 : Math.min(1, msLeft / (RULES.secondsPerQuestion * 1000));
  const urgent = msLeft <= 5000 && !revealing;
  return (
    <View style={styles.timerRow}>
      <View style={[styles.timerTrack, { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill }]}>
        <View
          style={{
            width: `${fraction * 100}%`,
            height: '100%',
            borderRadius: radius.pill,
            backgroundColor: urgent ? colors.danger : colors.primary,
          }}
        />
      </View>
      <AppText variant="label" color={urgent ? 'danger' : 'text'} style={styles.timerText}>
        {formatNumber(Math.ceil(msLeft / 1000))}
      </AppText>
    </View>
  );
}

function QuestionCard({ question, showDifficulty }: { question: Question; showDifficulty: boolean }) {
  const { colors, radius } = useTheme();
  const cat = getCategory(question.category);
  return (
    <Card style={{ minHeight: 150, justifyContent: 'center', paddingVertical: 22 }}>
      <View style={[styles.row, { justifyContent: 'center', gap: 8 }]}>
        {cat ? (
          <View style={[styles.tag, { backgroundColor: cat.color, borderRadius: radius.pill }]}>
            <Icon name={cat.icon} size={14} color="#FFFFFF" />
            <AppText variant="caption" style={{ color: '#FFFFFF' }}>
              {cat.nameAr}
            </AppText>
          </View>
        ) : null}
        {showDifficulty ? (
          <View style={[styles.tag, { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill }]}>
            <AppText variant="caption" color="textMuted">
              {t.game.difficulty[question.difficulty]}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="heading" align="center" style={{ fontSize: 22, lineHeight: 36 }}>
        {question.text}
      </AppText>
    </Card>
  );
}

function OptionButton({ index, label, status, onPress }: { index: number; label: string; status: OptionStatus; onPress: () => void }) {
  const { colors, radius } = useTheme();
  // 50:50 keeps the slot so the other answers don't jump.
  if (status === 'hidden') return <View style={styles.optionSpacer} />;
  const palette = {
    idle: { bg: colors.surface, border: colors.border, fg: 'text' as const, badge: colors.primarySoft },
    correct: { bg: colors.success, border: colors.success, fg: 'textOnPrimary' as const, badge: 'rgba(255,255,255,0.25)' },
    wrong: { bg: colors.danger, border: colors.danger, fg: 'textOnPrimary' as const, badge: 'rgba(255,255,255,0.25)' },
    dim: { bg: colors.surface, border: colors.border, fg: 'textMuted' as const, badge: colors.surfaceAlt },
  }[status];
  return (
    <PressableScale
      onPress={onPress}
      disabled={status !== 'idle'}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.option,
        { backgroundColor: palette.bg, borderColor: palette.border, borderRadius: radius.md, opacity: status === 'dim' ? 0.55 : 1 },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: palette.badge, borderRadius: radius.sm }]}>
        {status === 'correct' || status === 'wrong' ? (
          <Icon name={status === 'correct' ? 'check' : 'close'} size={20} color="#FFFFFF" />
        ) : (
          <AppText variant="label" color={status === 'idle' ? 'primary' : 'textMuted'}>
            {t.game.optionLetters[index]}
          </AppText>
        )}
      </View>
      <AppText variant="body" color={palette.fg} style={styles.flex}>
        {label}
      </AppText>
    </PressableScale>
  );
}

function Feedback({ phase, answer, questionId }: { phase: string; answer?: Answer; questionId: string }) {
  if (phase !== 'reveal' || !answer || answer.id !== questionId) return <View style={styles.feedback} />;
  const timedOut = !answer.correct && !answer.skipped && answer.ms >= RULES.secondsPerQuestion * 1000;
  const text = answer.skipped ? t.game.skipped : answer.correct ? t.game.correct : timedOut ? t.game.timeUp : t.game.wrong;
  return (
    <Animated.View entering={ZoomIn.duration(250)} style={styles.feedback}>
      <AppText variant="heading" align="center" color={answer.correct ? 'success' : answer.skipped ? 'textMuted' : 'danger'}>
        {text}
        {answer.correct ? `  +${formatNumber(answer.points)}` : ''}
      </AppText>
    </Animated.View>
  );
}

function Helpers({ disabled, fiftyUsed, apply }: { disabled: boolean; fiftyUsed: boolean; apply: (h: Helper) => void }) {
  const { colors, radius } = useTheme();
  const coins = useProgressStore((s) => s.coins);
  const spend = useProgressStore((s) => s.spendCoins);

  const use = (helper: Helper) => {
    if (!spend(HELPERS[helper].cost)) {
      Alert.alert(t.game.notEnoughCoins, t.game.notEnoughCoinsBody, [
        { text: t.common.cancel, style: 'cancel' },
        // The clock keeps running while the ad plays, so this is a real trade-off.
        { text: t.coins.watchForCoins, onPress: () => void watchAdForCoins().then((r) => r !== 'earned' && Alert.alert(r === 'limit' ? t.coins.limit : t.coins.unavailable)) },
      ]);
      return;
    }
    apply(helper);
  };

  return (
    <Animated.View entering={FadeIn} style={[styles.row, { gap: 8 }]}>
      {(Object.keys(HELPERS) as Helper[]).map((helper) => {
        const blocked = disabled || (helper === 'fifty' && fiftyUsed);
        return (
          <PressableScale
            key={helper}
            onPress={() => use(helper)}
            disabled={blocked}
            accessibilityRole="button"
            accessibilityLabel={t.game.helpers[helper]}
            style={[
              styles.helper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                opacity: blocked || coins < HELPERS[helper].cost ? 0.45 : 1,
              },
            ]}
          >
            <Icon name={HELPERS[helper].icon} size={22} color={colors.primary} />
            <AppText variant="caption">{t.game.helpers[helper]}</AppText>
            <View style={[styles.row, { gap: 2 }]}>
              <Icon name="circle-multiple" size={13} color={colors.accent} />
              <AppText variant="caption" color="textMuted">
                {formatNumber(HELPERS[helper].cost)}
              </AppText>
            </View>
          </PressableScale>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timerTrack: { flex: 1, height: 10, overflow: 'hidden' },
  timerText: { width: 28, textAlign: 'center' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, minHeight: 60, paddingHorizontal: 12, paddingVertical: 8 },
  optionSpacer: { minHeight: 60 },
  badge: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  feedback: { minHeight: 44, justifyContent: 'center', marginTop: 10 },
  helper: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8, borderWidth: 1 },
});
