import type { LinkDocument } from '../../website/src/lib/features/content/content.types.ts';
import { linkDocumentFromUnknown } from '../../website/src/lib/features/content/documents.validation.ts';
import { websiteRoot } from './paths.ts';
import fs from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

function readConfiguration(
  path: string = resolve(websiteRoot, 'src/data/links.yaml'),
): LinkDocument {
  const data: unknown = parse(fs.readFileSync(path, 'utf8'));

  return linkDocumentFromUnknown(data);
}

export { readConfiguration };

export * from '../../website/src/lib/features/navigation/routes.model.ts';
