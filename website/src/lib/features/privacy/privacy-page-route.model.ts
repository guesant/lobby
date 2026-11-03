export function privacyPageRoute(
  locale: string,
  interfaceName: 'minecraft' | 'terminal',
): string {
  let route = locale;

  if (interfaceName === 'terminal') {
    route += '/terminal';
  }

  return route;
}
