import {
  array,
  record,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { Source } from '../federation.types.ts';
import { validateSource } from './validate-source.ts';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export async function federationSources(): Promise<Source[]> {
  const sourceText = await readFile('.config/federation.yaml', 'utf8');

  const parsed: unknown = parse(sourceText);

  const config = record(parsed, 'federation configuration');

  const sources: Source[] = [];

  for (const source of array(config['sources'], 'federation sources')) {
    const validatedSource = validateSource(source);

    sources.push(validatedSource);
  }

  return sources;
}
