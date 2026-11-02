import type { LinkRecord } from './content.types.ts';
import { record, requiredText, strings } from './validation.model.ts';

export function linkStats(value: unknown, label: string): LinkRecord['stats'] {
  if (value === undefined) {
    return undefined;
  }

  const raw = record(value, label);

  return {
    provider: requiredText(raw['provider'], `${label}.provider`),
    metrics: strings(raw['metrics'], `${label}.metrics`),
  };
}
