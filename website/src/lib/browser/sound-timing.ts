import type { SoundTiming } from '../features/preferences/audio.types.ts';
import { delaySound } from './delay-sound.ts';
import { performanceTime } from './performance-time.ts';

export const soundTiming: SoundTiming = {
  now: performanceTime,
  delay: delaySound,
};
