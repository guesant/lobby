import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import { interfaceBodyClass } from '../navigation/navigation.viewmodel.ts';
import { documentContext } from './document-context.server.ts';
import { documentLanguage } from './document-language.server.ts';
import type { DocumentPresentation } from './document-presentation.types.ts';
import { fontPreloads } from './font-preloads.server.ts';

export function documentPresentation(
  data: SiteData,
  url: URL,
): DocumentPresentation {
  const {
    language,
    interfaceName,
    pathname
  } = documentContext(data, url);

  let pageID: string | undefined;

  for (const page of pagesFor(data, language, interfaceName)) {
    if (page.url.replace(/\/+$/, '') === pathname) {
      pageID = page.id;
      break;
    }
  }

  const presentation: DocumentPresentation = {
    language: documentLanguage(data, language),
    interfaceName,
    bodyClass: interfaceBodyClass(interfaceName),
    page: pageID ?? 'home',
    earlyHead: fontPreloads(interfaceName),
  };

  if (url.pathname === '/404.html' || (!pageID && url.pathname !== '/')) {
    presentation.interfaceName = 'error';
    presentation.bodyClass = 'error-interface';
    presentation.earlyHead = '';
  }

  return presentation;
}
