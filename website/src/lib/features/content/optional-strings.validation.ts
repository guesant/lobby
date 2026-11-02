import { strings } from './validation.model.ts';

export function optionalStrings(
  value: unknown,
  label: string,
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return strings(value, label);
}
