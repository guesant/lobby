export function clearSoundTimer(timer: ReturnType<typeof setTimeout>): void {
  clearTimeout(timer);
}
