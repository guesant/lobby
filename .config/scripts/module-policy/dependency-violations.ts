import type { Dependency } from '../module-dependencies.types.ts';
import { dependencyViolation } from './dependency-violation.ts';

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
