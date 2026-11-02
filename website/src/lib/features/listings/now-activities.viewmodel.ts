import type { PageLoadData } from '../content/content.types.ts';

export function nowActivities(data: PageLoadData): [
  string,
  string,
][] {
  const output: [
    string,
    string,
  ][] = [];

  for (const [
    key,
    value,
  ] of Object.entries(data.nowActivity)) {
    if (key !== 'updated' && value.trim().length > 0) {
      output.push([
        key,
        value,
      ]);
    }
  }

  return output;
}
