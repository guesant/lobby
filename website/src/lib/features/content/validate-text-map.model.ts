import { record } from './record.model.ts';

export function validateTextMap(
  value: unknown,
  label: string,
): Record<string, string> {
  const source = record(value, label);

  const output: Record<string, string> = {};

  for (const [
    key,
    entry,
  ] of Object.entries(source)) {
    if (typeof entry !== 'string') {
      throw new Error(`Invalid ${label}.${key}: expected a string`);
    }

    output[key] = entry;
  }

  return output;
}
