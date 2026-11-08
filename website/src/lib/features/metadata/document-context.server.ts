import type { SiteData } from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';
import type { DocumentContext } from './document-presentation.types.ts';

export function documentContext(data: SiteData, url: URL): DocumentContext {
  const parts = url.pathname.split('/')
    .filter(Boolean);

  let language = data.links.language_preference.default;

  for (const option of data.links.language_options) {
    if (option.id === parts[0]) {
      language = option.id;
      break;
    }
  }

  const joinedPath = parts.join('/');

  const normalizedPath = `/${joinedPath}`.replace(/\/+$/, '');

  const pathname = textOr(normalizedPath, '/');

  return {
    language,
    interfaceName: 'voxel',
    pathname,
  };
}
