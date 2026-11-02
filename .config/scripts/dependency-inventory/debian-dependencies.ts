import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';

export function debianDependencies(
  docker: string,
  dockerfile: string,
): ManagedDependency[] {
  const dependencies: ManagedDependency[] = [];

  for (const install of docker.matchAll(/apt-get install\s+([^&]+)/g)) {
    for (const match of (install[1] ?? '').matchAll(
      /(?:^|\s)([a-z][a-z0-9+.-]*)=([^\s\\]+)/g,
    )) {
      const name = requiredText(match[1], 'Debian package');

      const version = requiredText(match[2], 'Debian version');

      dependencies.push({
        file: dockerfile,
        manager: 'dockerfile',
        name,
        version,
      });
    }
  }

  return dependencies;
}
