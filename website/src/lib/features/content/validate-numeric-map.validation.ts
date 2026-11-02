import { record } from './validation.model.ts';

export function validateNumericMap(
  value: unknown,
  label: string,
): Record<string, number> {
  const source = record(value, label);

  const output: Record<string, number> = {};

  for (const [
    key,
    entry,
  ] of Object.entries(source)) {
    if (typeof entry !== 'number' || !Number.isFinite(entry) || entry < 0) {
      throw new Error(
        `Invalid ${label}.${key}: expected a non-negative number`,
      );
    }

    output[key] = entry;
  }

  return output;
}
