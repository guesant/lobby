import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';
import { readFile } from 'node:fs/promises';

export async function pythonDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  const python = '.config/python/pyproject.toml';

  for (const match of (await readFile(python, 'utf8')).matchAll(
    /"([a-z][\w-]*)==([^"\s]+)"/g,
  )) {
    const name = requiredText(match[1], 'Python package');

    const version = requiredText(match[2], 'Python version');

    dependencies.push({
      file: python,
      manager: 'pep621',
      name,
      version,
    });
  }

  return dependencies;
}
