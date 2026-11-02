import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';

export function dockerfileImageDependencies(
  docker: string,
  dockerfile: string,
): ManagedDependency[] {
  const dependencies: ManagedDependency[] = [];

  for (const match of docker.matchAll(/^FROM\s+(\S+)/gm)) {
    const image = requiredText(match[1], 'Docker image');

    if (!image.includes(':')) {
      continue;
    }

    const parts = /^(.+):([^@]+)@(sha256:[a-f0-9]{64})$/.exec(image);

    if (!parts) {
      throw new Error(`Unpinned Docker image: ${image}`);
    }

    const name = requiredText(parts[1], 'image name');

    const version = requiredText(parts[2], 'image version');

    dependencies.push({
      file: dockerfile,
      manager: 'dockerfile',
      name,
      version,
    });
  }

  return dependencies;
}
