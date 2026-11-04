export function privacyPageURL(
  locale: string,
  interfaceName: 'voxel' | 'terminal',
): string {
  let prefix = `/${locale}/`;

  if (interfaceName === 'terminal') {
    prefix += 'terminal/';
  }

  return `${prefix}privacy/`;
}
