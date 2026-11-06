import pa11yDefaults from '../pa11yci.json' with { type: 'json' };
import type { AccessibilityAudit } from './accessibility-viewports.types.ts';
import * as configuration from './configuration.ts';

const config = configuration.readConfiguration();

const routes = config.language_options.flatMap((language): string[] => {
  return configuration
    .pagesFor(config, language.id)
    .filter((page): boolean => {
      return !page.fallback;
    })
    .map((page): string => {
      return page.url;
    });
});

function lightThemeRoutes(): string[] {
  const homeRoutes = config.language_options.flatMap((language): string[] => {
    return configuration
      .pagesFor(config, language.id)
      .filter((page): boolean => {
        return !page.fallback && page.id === 'home';
      })
      .map((page): string => {
        return page.url;
      });
  });

  const defaultLanguage = config.language_options[0];

  if (!defaultLanguage) {
    return homeRoutes;
  }

  const representativeThemeRoutes = configuration
    .pagesFor(config, defaultLanguage.id)
    .filter((page): boolean => {
      return (
        !page.fallback &&
        [
          'career',
          'code',
        ].includes(page.id)
      );
    })
    .map((page): string => {
      return page.url;
    });

  return [
    ...homeRoutes,
    ...representativeThemeRoutes,
  ];
}

function appearanceAudits(
  path: string,
  detailed = false,
  themes: ('dark' | 'light')[] = [
    'dark',
  ],
): AccessibilityAudit[] {
  return themes.map((theme): AccessibilityAudit => {
    const actions = [
      'click element [data-settings-open]',
      'wait for element #settings-dialog to be added',
      `click element label[for="theme-${theme}"]`,
      'click element #settings-dialog [data-dialog-close]',
    ];

    if (detailed) {
      actions.unshift('click element label[for="link-view-detailed"]');
    }

    return {
      url: `http://127.0.0.1:4173${path}`,
      actions,
    };
  });
}

function navigationAudits(path: string): AccessibilityAudit[] {
  return [
    {
      url: `http://127.0.0.1:4173${path}career/`,
      rootElement: '.profile-navigation',
      actions: [
        'click element [data-settings-open]',
        'wait for element #settings-dialog to be added',
        'click element label[for="theme-dark"]',
        'click element #settings-dialog [data-dialog-close]',
      ],
    },
  ];
}

export function accessibilityAudits(): {
  pa11y: {
    defaults: typeof pa11yDefaults.defaults;
    urls: AccessibilityAudit[];
  };
  measuredCount: number;
} {
  const urls = routes.flatMap((path): AccessibilityAudit[] => {
    return appearanceAudits(path);
  });

  urls.push(
    ...lightThemeRoutes()
      .flatMap((path): AccessibilityAudit[] => {
        return appearanceAudits(path, false, [
          'light',
        ]);
      }),
  );

  const detailedLanguages = config.language_options.filter(
    (language): boolean => {
      return language.id === 'pt-br' || language.id === 'zh';
    },
  );

  const detailedPaths = detailedLanguages.flatMap((language): string[] => {
    return [
      language.path,
      `${language.path}code/`,
    ];
  });

  urls.push(
    ...detailedPaths.flatMap((path): AccessibilityAudit[] => {
      return appearanceAudits(path, true);
    }),
  );

  urls.push(
    ...config.language_options.flatMap((language): AccessibilityAudit[] => {
      return navigationAudits(language.path);
    }),
  );

  const measuredCount = urls.length;

  return {
    pa11y: {
      defaults: structuredClone(pa11yDefaults.defaults),
      urls,
    },
    measuredCount,
  };
}
