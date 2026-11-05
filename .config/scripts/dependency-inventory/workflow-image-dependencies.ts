import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';

export function workflowImageDependencies(
  file: string,
  source: string,
): ManagedDependency[] {
  const dependencies: ManagedDependency[] = [];

  for (const match of source.matchAll(
    /\b(node|ghcr\.io\/renovatebot\/renovate):([\d.]+(?:-bookworm(?:-slim)?|-full))@(sha256:[a-f0-9]{64})/g,
  )) {
    const name = requiredText(match[1], 'inline image name');

    const version = requiredText(match[2], 'inline image version');

    const digest = requiredText(match[3], 'inline image digest');

    dependencies.push({
      file,
      manager: 'regex',
      name,
      version,
      digest,
    });
  }

  return dependencies;
}
