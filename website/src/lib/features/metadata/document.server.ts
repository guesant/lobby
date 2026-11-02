import terminalFont from '../../../assets/fonts/jetbrains-mono-latin.woff2';
import bodyFont from '../../../assets/fonts/oxanium-latin.woff2';
import headingFont from '../../../assets/fonts/press-start-2p-latin.woff2';
import type { SiteData } from '../content/content.types.ts';
import { textOr } from '../content/text.model.ts';
import { pagesFor } from '../navigation/catalog.model.ts';
import { interfaceBodyClass } from '../navigation/navigation.viewmodel.ts';
import { preferenceOptions } from '../preferences/preferences.model.ts';

type DocumentPresentation = {
  language: string;
  interfaceName: string;
  bodyClass: string;
  page: string;
  earlyHead: string;
};

function fontPreloads(interfaceName: string): string {
  if (interfaceName === 'terminal') {
    return `<link rel="preload" href="${terminalFont}" as="font" type="font/woff2" crossorigin="anonymous">`;
  }

  return `<link rel="preload" href="${headingFont}" as="font" type="font/woff2" crossorigin="anonymous"><link rel="preload" href="${bodyFont}" as="font" type="font/woff2" crossorigin="anonymous">`;
}

function documentContext(
  data: SiteData,
  url: URL,
): {
  language: string;
  interfaceName: 'minecraft' | 'terminal';
  pathname: string;
} {
  const parts = url.pathname.split('/')
    .filter(Boolean);

  const language =
    data.links.language_options.find((option): boolean => {
      return option.id === parts[0];
    })?.id ?? data.links.language_preference.default;

  let interfaceName: 'minecraft' | 'terminal' = 'minecraft';

  if (parts[1] === 'terminal') {
    interfaceName = 'terminal';
  }

  const pathname = textOr(`/${parts.join('/')}`.replace(/\/+$/, ''), '/');

  return {
    language,
    interfaceName,
    pathname,
  };
}

function documentLanguage(data: SiteData, language: string): string {
  return (
    data.links.locales[language]?.ui.html_lang ??
    data.links.locales['en']?.ui.html_lang ??
    'en'
  );
}

function documentPresentation(data: SiteData, url: URL): DocumentPresentation {
  const {
    language,
    interfaceName,
    pathname
  } = documentContext(data, url);

  const currentPage = pagesFor(data, language, interfaceName)
    .find(
      (entry): boolean => {
        return entry.url.replace(/\/+$/, '') === pathname;
      },
    );

  const presentation: DocumentPresentation = {
    language: documentLanguage(data, language),
    interfaceName,
    bodyClass: interfaceBodyClass(interfaceName),
    page: currentPage?.id ?? 'home',
    earlyHead: fontPreloads(interfaceName),
  };

  if (url.pathname === '/404.html' || (!currentPage && url.pathname !== '/')) {
    presentation.interfaceName = 'error';
    presentation.bodyClass = 'error-interface';
    presentation.earlyHead = '';
  }

  return presentation;
}

export function renderDocument(html: string, data: SiteData, url: URL): string {
  const presentation = documentPresentation(data, url);

  return html
    .replace('__PREFERENCE_OPTIONS__', JSON.stringify(preferenceOptions))
    .replace('__LANG__', presentation.language)
    .replace('__INTERFACE__', presentation.interfaceName)
    .replace('__PAGE__', presentation.page)
    .replace('__BODY_CLASS__', presentation.bodyClass)
    .replace('__EARLY_HEAD__', presentation.earlyHead);
}
