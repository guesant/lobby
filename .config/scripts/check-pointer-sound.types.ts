import type {
  PointerFeedback,
  SoundKind,
} from '../../website/src/lib/features/preferences/audio.types.ts';

export type FeedbackHarness = {
  feedback: PointerFeedback;
  sounds: SoundKind[];
  timers: Set<() => void>;
  setReady(value: boolean): void;
  elapsed(value: number): void;
  flush(): void;
  prepared(): number;
  destroyed(): boolean;
};
