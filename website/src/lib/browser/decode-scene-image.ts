import type { ProgressiveSceneState } from './progressive-scene.types.ts';

export async function decodeSceneImage(
  state: ProgressiveSceneState,
  source: string,
  priority?: 'high' | 'low',
): Promise<void> {
  const pending = state.decoded.get(source);

  if (pending) {
    return pending;
  }

  const image = new Image();

  if (priority) {
    image.fetchPriority = priority;
  }

  image.src = source;

  const loading = image.decode();

  state.decoded.set(source, loading);

  try {
    await loading;
  } catch (error) {
    state.decoded.delete(source);

    throw error;
  }
}
