import { isVisualModule } from './is-visual-module.ts';

export function visualBoundaryViolation(
  file: string,
  target: string,
): string | undefined {
  if (
    file.endsWith('.svelte') &&
    (target.includes('.server') || target.startsWith('node:'))
  ) {
    return `${file}: Views cannot import integrations: ${target}`;
  }

  if (/\.controller(?:\.server)?\.ts$/.test(file) && isVisualModule(target)) {
    return `${file}: Controllers cannot import Views: ${target}`;
  }

  return undefined;
}
