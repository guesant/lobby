import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import type { Source } from '../federation.types.ts';
import { sourceID, text } from '../federation-validation.ts';

export function validateSource(value: unknown): Source {
  const source = record(value, 'federation source');

  const sourceText = text(source['id']);

  const id = sourceID(sourceText);

  const origin = text(source['origin']);

  const url = text(source['url']);

  if (new URL(url).origin !== origin || new URL(url).protocol !== 'https:') {
    throw new Error('Invalid source URL');
  }

  return {
    id,
    origin,
    url,
  };
}
