import type { LinkRecord } from './content.types.ts';
import { positiveInteger } from './positive-integer.validation.ts';
import { record, requiredText, validateTextMap } from './validation.model.ts';

export function linkVisual(
  value: unknown,
  label: string,
): LinkRecord['visual'] {
  if (value === undefined) {
    return undefined;
  }

  const raw = record(value, label);

  return {
    src: requiredText(raw['src'], `${label}.src`),
    alt: validateTextMap(raw['alt'], `${label}.alt`),
    kind: requiredText(raw['kind'], `${label}.kind`),
    width: positiveInteger(raw['width'], `${label}.width`),
    height: positiveInteger(raw['height'], `${label}.height`),
  };
}
