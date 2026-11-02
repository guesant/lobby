import type { LinkDocument } from '../../website/src/lib/features/content/content.types.ts';
import { linkDocumentFromUnknown } from '../../website/src/lib/features/content/documents.validation.ts';
import { websiteRoot } from './paths.ts';
import fs from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

function readConfiguration(
  path: string = resolve(websiteRoot, 'src/data/links.yaml'),
): LinkDocument {
  const source = fs.readFileSync(path, 'utf8');

  const data: unknown = parse(source);

  return linkDocumentFromUnknown(data);
}

export { readConfiguration };

export * from '../../website/src/lib/features/navigation/routes.model.ts';
