import fs from 'node:fs';
import { resolve } from 'node:path';
import { websiteRoot } from './paths.ts';
import { parse } from 'yaml';
import { linkDocumentFromUnknown } from '../../website/src/lib/data-validation.ts';
import type { LinkDocument } from '../../website/src/lib/site-data.ts';

const readConfiguration = (
  path: string = resolve(websiteRoot, 'src/data/links.yaml'),
): LinkDocument => {
  const data: unknown = parse(fs.readFileSync(path, 'utf8'));

  return linkDocumentFromUnknown(data);
};

export { readConfiguration };

export * from '../../website/src/lib/configuration.ts';
