import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';
import { parse } from 'yaml';

export function workflowActionDependencies(
  file: string,
  source: string,
): ManagedDependency[] {
  parse(source);

  const dependencies: ManagedDependency[] = [];

  for (const match of source.matchAll(/\buses:\s+([^\s@]+)@([^\s]+)/g)) {
    const version = requiredText(match[2], 'action revision');

    const actionName = requiredText(match[1], 'action name');

    const normalizedName = actionName.split('/')
      .slice(0, 2)
      .join('/');

    if (!/^[a-f0-9]{40}$/.test(version)) {
      throw new Error(`Unpinned action: ${file}: ${String(match[1])}`);
    }

    dependencies.push({
      file,
      manager: 'github-actions',
      name: normalizedName,
      version,
    });
  }

  return dependencies;
}
