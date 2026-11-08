import type { SiteData } from '../content/content.types.ts';
import { interfaceBodyClass } from '../navigation/navigation.viewmodel.ts';
import { documentContext } from './document-context.server.ts';
import { documentLanguage } from './document-language.server.ts';
import { documentPageID } from './document-page-id.server.ts';
import type { DocumentPresentation } from './document-presentation.types.ts';
import { fontPreloads } from './font-preloads.server.ts';

export function documentPresentation(
  data: SiteData,
  url: URL,
): DocumentPresentation {
  const context = documentContext(data, url);

  const {
    language,
    interfaceName
  } = context;

  const pageID = documentPageID(data, context);

  const presentation: DocumentPresentation = {
    language: documentLanguage(data, language),
    interfaceName,
    bodyClass: interfaceBodyClass(),
    page: pageID ?? 'home',
    earlyHead: fontPreloads(),
  };

  if (url.pathname === '/404.html' || (!pageID && url.pathname !== '/')) {
    presentation.interfaceName = 'error';
    presentation.bodyClass = 'error-interface';
    presentation.earlyHead = '';
  }

  return presentation;
}
