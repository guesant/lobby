export type SoundKind = 'press' | 'release';

export type PointerInput = {
  isTrusted: boolean;
  pointerType: string;
  button: number;
  pointerId: number;
};

export type SoundPlayer = {
  prepare: () => void;
  resume: () => void;
  ready: (kind: SoundKind) => boolean;
  play: (kind: SoundKind) => void;
  stop: () => void;
  destroy: () => void;
};

export type SoundTiming = {
  now: () => number;
  delay: (callback: () => void, duration: number) => () => void;
};

export type PointerFeedback = {
  press: (event: PointerInput) => void;
  release: (event: PointerInput) => void;
  cancel: (pointerId: number) => void;
  reset: () => void;
  setEnabled: (enabled: boolean) => void;
  destroy: () => void;
};

export type PointerSound = Pick<PointerFeedback, 'setEnabled' | 'destroy'>;
