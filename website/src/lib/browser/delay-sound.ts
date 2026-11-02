import { clearSoundTimer } from './clear-sound-timer.ts';

export function delaySound(callback: () => void, duration: number): () => void {
  const timer = setTimeout(callback, duration);

  return clearSoundTimer.bind(null, timer);
}
