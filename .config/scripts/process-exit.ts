import type { ProcessState } from './process.types.ts';

export function processExit(
  state: ProcessState,
  code: number | null,
  signal: NodeJS.Signals | null,
): void {
  if (code === 0) {
    state.resolve(undefined);

    return;
  }

  const failureCode = String(code ?? signal);

  const error = new Error(`${state.name} failed: ${failureCode}`);

  state.reject(error);
}
