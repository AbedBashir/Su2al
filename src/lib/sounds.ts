import { useSettingsStore } from '@/stores/settingsStore';

/** Short sound effects (made for the game, no third-party audio). Respects the sound setting. */
const SOURCES = {
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  win: require('../../assets/sounds/win.wav'),
  lose: require('../../assets/sounds/lose.wav'),
  coin: require('../../assets/sounds/coin.wav'),
  revive: require('../../assets/sounds/revive.wav'),
} as const;
export type Sound = keyof typeof SOURCES;

type AudioModule = typeof import('expo-audio');
type Player = ReturnType<AudioModule['createAudioPlayer']>;

// Loaded lazily and optionally, so a build without the native module just stays silent.
let audio: AudioModule | null | undefined;
const players: Partial<Record<Sound, Player>> = {};

function load(): AudioModule | null {
  if (audio !== undefined) return audio;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: a build without the native module stays silent
    audio = require('expo-audio') as AudioModule;
    // Sound effects mix with the player's music and stay quiet on silent/vibrate.
    void audio.setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  } catch {
    audio = null;
  }
  return audio;
}

/** Creates the players up front so the first sound isn't late. */
export function preloadSounds() {
  const m = load();
  if (!m) return;
  for (const key of Object.keys(SOURCES) as Sound[]) {
    try {
      players[key] ??= m.createAudioPlayer(SOURCES[key]);
    } catch {
      // A missing sound is never worth a crash.
    }
  }
}

export function play(sound: Sound) {
  if (!useSettingsStore.getState().soundEnabled) return;
  const m = load();
  if (!m) return;
  try {
    const player = (players[sound] ??= m.createAudioPlayer(SOURCES[sound]));
    void player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // ignore
  }
}
