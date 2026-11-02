import pa11yDefaults from '../pa11yci.json' with { type: 'json' };
import { type AccessibilityAudit } from './accessibility-viewports.ts';
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

function appearanceAudits(
  path: string,
  detailed = false,
): AccessibilityAudit[] {
  return [
    'dark',
    'light',
  ].map((theme): AccessibilityAudit => {
    const actions = [
      'click element [data-settings-open]',
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
    'dark',
    'light',
  ].map((theme): AccessibilityAudit => {
    return {
      url: `http://127.0.0.1:4173${path}career/`,
      rootElement: '.profile-navigation',
      actions: [
        'click element [data-settings-open]',
        `click element label[for="theme-${theme}"]`,
        'click element #settings-dialog [data-dialog-close]',
      ],
    };
  });
}

function dialogActions(dialog: string): string[] {
  if (dialog === 'credits') {
    return [
      'click element #settings-dialog [data-dialog-close]',
      'click element [data-credits-open]',
    ];
  }

  return [];
}

function dialogAudits(path: string): AccessibilityAudit[] {
  return [
    'dark',
    'light',
  ].flatMap((theme): AccessibilityAudit[] => {
    return [
      'settings',
      'credits',
    ].map((dialog): AccessibilityAudit => {
      return {
        url: `http://127.0.0.1:4173${path}`,
        actions: [
          'click element [data-settings-open]',
          `click element label[for="theme-${theme}"]`,
          ...dialogActions(dialog),
        ],
      };
    });
  });
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

  const measuredCount = urls.length + config.language_options.length * 6;

  urls.push(
    ...config.language_options.flatMap((language): AccessibilityAudit[] => {
      return [
        language.path,
        `${language.path}code/`,
      ].flatMap((path): AccessibilityAudit[] => {
        return appearanceAudits(path, true);
      });
    }),
  );
  urls.push(
    ...config.language_options.flatMap((language): AccessibilityAudit[] => {
      return navigationAudits(language.path);
    }),
    ...config.language_options.flatMap((language): AccessibilityAudit[] => {
      return dialogAudits(language.path);
    }),
  );

  return {
    pa11y: {
      defaults: structuredClone(pa11yDefaults.defaults),
      urls,
    },
    measuredCount,
  };
}
