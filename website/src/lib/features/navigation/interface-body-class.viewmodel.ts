import type { PageLoadData } from '../content/content.types.ts';

export function interfaceBodyClass(
  interfaceName: PageLoadData['interfaceName'],
): string {
  if (interfaceName === 'terminal') {
    return 'terminal-interface';
  }

  return 'theme-minecraft appearance-system background-default';
}
