export function privacyPageRoute(
  locale: string,
  interfaceName: 'voxel' | 'terminal',
): string {
  let route = locale;

  if (interfaceName === 'terminal') {
    route += '/terminal';
  }

  return route;
}
