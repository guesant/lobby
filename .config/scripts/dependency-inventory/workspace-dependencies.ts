import {
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export async function workspaceDependencies(
  file: string,
): Promise<ManagedDependency[]> {
  const path = file.replace('package.json', 'pnpm-workspace.yaml');

  const source = await readFile(path, 'utf8');

  const parsed: unknown = parse(source);

  const workspace = record(parsed, 'pnpm workspace');

  const dependencies: ManagedDependency[] = [];

  const overrides = record(workspace['overrides'] ?? {}, 'pnpm overrides');

  for (const [
    name,
    version,
  ] of Object.entries(overrides)) {
    const normalizedVersion = requiredText(version, `override ${name}`);

    dependencies.push({
      file: path,
      manager: 'npm',
      name,
      version: normalizedVersion,
    });
  }

  return dependencies;
}
