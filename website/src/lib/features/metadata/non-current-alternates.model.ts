import type { Alternate } from './metadata.types.ts';

export function nonCurrentAlternates(
  routes: Alternate[],
  locale: string,
): Alternate[] {
  const output: Alternate[] = [];

  for (const route of routes) {
    if (route.id !== locale) {
      output.push(route);
    }
  }

  return output;
}
