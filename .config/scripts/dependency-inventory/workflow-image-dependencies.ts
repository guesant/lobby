import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';

export function workflowImageDependencies(
  file: string,
  source: string,
): ManagedDependency[] {
  const dependencies: ManagedDependency[] = [];

  for (const match of source.matchAll(
    /\b(node):([\d.]+-bookworm(?:-slim)?)@(sha256:[a-f0-9]{64})/g,
  )) {
    const version = requiredText(match[2], 'inline image version');

    dependencies.push({
      file,
      manager: 'regex',
      name: 'node',
      version,
    });
  }

  return dependencies;
}
