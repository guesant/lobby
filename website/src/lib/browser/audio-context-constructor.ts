export function audioContextConstructor(): typeof AudioContext | undefined {
  const api: {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  } = window;

  return api.AudioContext ?? api.webkitAudioContext;
}
