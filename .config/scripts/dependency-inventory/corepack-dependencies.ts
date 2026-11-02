import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';

export function corepackDependencies(
  docker: string,
  dockerfile: string,
): ManagedDependency[] {
  const dependencies: ManagedDependency[] = [];

  for (const match of docker.matchAll(
    /ARG COREPACK_VERSION=(v[\d.]+)\s+ARG COREPACK_SHA256=([a-f0-9]{64})/g,
  )) {
    const version = requiredText(match[1], 'Corepack version');

    const digest = requiredText(match[2], 'Corepack SHA-256');

    dependencies.push({
      file: dockerfile,
      manager: 'regex',
      name: 'nodejs/corepack',
      version,
      digest,
    });
  }

  return dependencies;
}
