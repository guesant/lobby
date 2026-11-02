import { isVisualModule } from './is-visual-module.ts';

export function isBrowserDependency(target: string): boolean {
  return (
    isVisualModule(target) ||
    target.startsWith('$app/') ||
    target.includes('/browser/')
  );
}
