import {
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import { dependencySnapshotTargets } from '../dependency-snapshot-targets.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';
import { workspaceDependencies } from './workspace-dependencies.ts';
import { readFile } from 'node:fs/promises';

export async function packageDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  for (const {
    directory
  } of dependencySnapshotTargets) {
    const file = `${directory}/package.json`;

    const workspaceEntries = await workspaceDependencies(file);

    const source = await readFile(file, 'utf8');

    const parsed: unknown = JSON.parse(source);

    const manifest = record(parsed, file);

    for (const section of [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
    ]) {
      const sectionRecord = record(
        manifest[section] ?? {},
        `${file} ${section}`,
      );

      for (const [
        name,
        value,
      ] of Object.entries(sectionRecord)) {
        const version = requiredText(value, `version ${name}`);

        dependencies.push({
          file,
          manager: 'npm',
          name,
          version,
        });
      }
    }

    const packageManager = requiredText(
      manifest['packageManager'],
      `${file} package manager`,
    );

    dependencies.push(...workspaceEntries, {
      file,
      manager: 'npm',
      name: 'pnpm',
      version: packageManager,
    });
  }

  return dependencies;
}
