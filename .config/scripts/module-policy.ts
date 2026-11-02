import type { Dependency } from './module-dependencies.ts';

function visualModule(specifier: string): boolean {
  return (
    specifier.endsWith('.svelte') ||
    /\/(?:interfaces|components)\//.test(specifier)
  );
}

function modelModule(file: string): boolean {
  return /\.(?:model|validation|types)\.ts$/.test(file);
}

function browserDependency(target: string): boolean {
  return (
    visualModule(target) ||
    target.startsWith('$app/') ||
    target.includes('/browser/')
  );
}

function visualBoundaryViolation(
  file: string,
  target: string,
): string | undefined {
  if (
    file.endsWith('.svelte') &&
    (target.includes('.server') || target.startsWith('node:'))
  ) {
    return `${file}: Views cannot import integrations: ${target}`;
  }

  if (/\.controller(?:\.server)?\.ts$/.test(file) && visualModule(target)) {
    return `${file}: Controllers cannot import Views: ${target}`;
  }

  return undefined;
}

function dependencyViolation(
  file: string,
  dependency: Dependency,
): string | undefined {
  if (dependency.typeOnly) {
    return undefined;
  }

  const target = dependency.specifier;

  if (modelModule(file) && browserDependency(target)) {
    return `${file}: Models cannot depend on presentation or browser adapters: ${target}`;
  }

  if (/\.viewmodel(?:\.svelte)?\.ts$/.test(file) && browserDependency(target)) {
    return `${file}: ViewModels cannot import visual or browser dependencies: ${target}`;
  }

  return visualBoundaryViolation(file, target);
}

export function dependencyViolations(
  file: string,
  dependencies: Dependency[],
): string[] {
  const violations: string[] = [];

  for (const dependency of dependencies) {
    const violation = dependencyViolation(file, dependency);

    if (violation) {
      violations.push(violation);
    }
  }

  return violations;
}
