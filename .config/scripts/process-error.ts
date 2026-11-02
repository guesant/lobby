import type { ProcessState } from './process.types.ts';

export function processError(state: ProcessState, error: Error): void {
  state.reject(error);
}
