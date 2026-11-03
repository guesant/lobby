import type { Dependency } from '../module-dependencies.types.ts';
import { isBrowserDependency } from './is-browser-dependency.ts';
import { isModelModule } from './is-model-module.ts';
import { visualBoundaryViolation } from './visual-boundary-violation.ts';

export function dependencyViolation(
  file: string,
  dependency: Dependency,
): string | undefined {
  if (dependency.typeOnly) {
    return undefined;
  }

  const target = dependency.specifier;

  if (isModelModule(file) && isBrowserDependency(target)) {
    return `${file}: Models cannot depend on presentation or browser adapters: ${target}`;
  }

  if (
    /\.viewmodel(?:\.svelte)?\.ts$/.test(file) &&
    isBrowserDependency(target)
  ) {
    return `${file}: ViewModels cannot import visual or browser dependencies: ${target}`;
  }

  return visualBoundaryViolation(file, target);
}
