import type {
  SoundKind,
  SoundPlayer,
} from '../features/preferences/audio.types.ts';

function unavailableAudio(): void {
  return;
}

function audioConstructor(): typeof AudioContext | undefined {
  const api: {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  } = window;

  return api.AudioContext ?? api.webkitAudioContext;
}

export class WebAudioPlayer implements SoundPlayer {
  #controller = new AbortController();

  #context: AudioContext | undefined;

  #gain: GainNode | undefined;

  #playing: AudioBufferSourceNode | undefined;

  #buffers: Partial<Record<SoundKind, AudioBuffer>> = {};

  #urls: Record<SoundKind, string>;

  constructor(urls: Record<SoundKind, string>) {
    this.#urls = urls;
  }

  stop(): void {
    const playing = this.#playing;

    if (!playing) {
      return;
    }

    this.#playing = undefined;

    try {
      playing.stop();
    } catch {
      return;
    } finally {
      playing.disconnect();
    }
  }

  async #load(kind: SoundKind, context: AudioContext): Promise<void> {
    try {
      const response = await fetch(this.#urls[kind], {
        priority: 'low',
        signal: this.#controller.signal,
      });

      if (!response.ok) {
        return;
      }

      const buffer = await context.decodeAudioData(
        await response.arrayBuffer(),
      );

      if (!this.#controller.signal.aborted) {
        this.#buffers[kind] = buffer;
      }
    } catch {
      return;
    }
  }

  prepare(): void {
    if (this.#context !== undefined || this.#controller.signal.aborted) {
      return;
    }

    const constructor = audioConstructor();

    if (!constructor) {
      return;
    }

    try {
      const context = new constructor();

      this.#context = context;
      this.#initialize(context);
    } catch {
      void this.#context?.close()
        .catch(unavailableAudio);
      this.#context = undefined;
      this.#gain = undefined;
    }
  }

  #initialize(context: AudioContext): void {
    const gain = context.createGain();

    gain.gain.value = 0.04;
    gain.connect(context.destination);
    this.#gain = gain;
    void this.#load('press', context);
    void this.#load('release', context);
  }

  resume(): void {
    if (this.#context?.state !== 'suspended') {
      return;
    }

    try {
      void this.#context.resume()
        .catch(unavailableAudio);
    } catch {
      return;
    }
  }

  ready(kind: SoundKind): boolean {
    return Boolean(
      this.#gain && this.#buffers[kind] && this.#context?.state === 'running',
    );
  }

  play(kind: SoundKind): void {
    this.stop();

    const buffer = this.#buffers[kind];

    const gain = this.#gain;

    if (!gain || !buffer || this.#context?.state !== 'running') {
      return;
    }

    const source = this.#context.createBufferSource();

    source.buffer = buffer;
    source.connect(gain);
    source.addEventListener(
      'ended',
      (): void => {
        source.disconnect();

        if (this.#playing === source) {
          this.#playing = undefined;
        }
      },
      {
        once: true,
        signal: this.#controller.signal,
      },
    );

    try {
      source.start();
      this.#playing = source;
    } catch {
      source.disconnect();
    }
  }

  destroy(): void {
    this.#controller.abort();
    this.stop();
    void this.#context?.close()
      .catch(unavailableAudio);
  }
}
