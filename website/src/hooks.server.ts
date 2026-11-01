import type { Handle } from '@sveltejs/kit';
import { getSiteData, pagesFor } from './lib/site-data.server.ts';
import terminalFont from './assets/fonts/jetbrains-mono-latin.woff2';
import headingFont from './assets/fonts/press-start-2p-latin.woff2';
import bodyFont from './assets/fonts/oxanium-latin.woff2';

export const handle: Handle = async ({
  event,
  resolve
}): Promise<Response> => {
  const data = await getSiteData();

  return resolve(event, {
    preload: ({
      type
    }): boolean => {
      return type !== 'js' && type !== 'font';
    },
    transformPageChunk: ({
      html
    }): string => {
      const parts = event.url.pathname.split('/')
        .filter(Boolean);

      const languages = data.links.language_options.map((option): string => {
        return option.id;
      });

      const hasLanguage = !!parts[0] && languages.includes(parts[0]);

      const resolveLanguage = (): string => {
        if (hasLanguage && parts[0]) {
          return parts[0];
        }

        return data.links.language_preference.default;
      };

      const language = resolveLanguage();

      const terminal = parts[1] === 'terminal';

      const resolveInterfaceName = (): 'terminal' | 'minecraft' => {
        if (terminal) {
          return 'terminal';
        }

        return 'minecraft';
      };

      const interfaceName = resolveInterfaceName();

      const resolveBodyClass = ():
        | 'terminal-interface'
        | 'theme-minecraft appearance-system background-default' => {
        if (terminal) {
          return 'terminal-interface';
        }

        return 'theme-minecraft appearance-system background-default';
      };

      const bodyClass = resolveBodyClass();

      const resolveEarlyHead = (): string => {
        if (terminal) {
          return `<link rel="preload" href="${terminalFont}" as="font" type="font/woff2" crossorigin="anonymous">`;
        }

        return `<link rel="preload" href="${headingFont}" as="font" type="font/woff2" crossorigin="anonymous"><link rel="preload" href="${bodyFont}" as="font" type="font/woff2" crossorigin="anonymous">`;
      };

      const earlyHead = resolveEarlyHead();

      const currentPages = pagesFor(data, language, interfaceName);

      const pathname = `/${parts.join('/')}`.replace(/\/+$/, '') || '/';

      const currentPage = currentPages.find((entry): boolean => {
        return entry.url.replace(/\/+$/, '') === pathname;
      });

      const page = currentPage?.id || 'home';

      const errorPage =
        event.url.pathname === '/404.html' ||
        (!currentPage && event.url.pathname !== '/');

      let renderedInterface: string = interfaceName;

      let renderedClass: string = bodyClass;

      let renderedHead: string = earlyHead;

      if (errorPage) {
        renderedInterface = 'error';
        renderedClass = 'error-interface';
        renderedHead = '';
      }

      return html
        .replace(
          '__LANG__',
          data.links.locales[language]?.ui.html_lang ||
            data.links.locales.en?.ui.html_lang ||
            'en',
        )
        .replace('__INTERFACE__', renderedInterface)
        .replace('__PAGE__', page)
        .replace('__BODY_CLASS__', renderedClass)
        .replace('__EARLY_HEAD__', renderedHead);
    },
  });
};
