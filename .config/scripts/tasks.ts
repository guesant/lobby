import { runCommand as command } from './process.ts';
import { withStaticServer as withServer } from './static-server.ts';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as configuration from './configuration.ts';
import accessibilityViewports, {
  type AccessibilityAudit,
} from './accessibility-viewports.ts';
import pa11yDefaults from '../pa11yci.json' with { type: 'json' };
import { syncFederation } from './federation.ts';
import { dependencySBOMs } from './security-inputs.ts';

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

export type Command = (
  name: string,
  args?: string[],
  env?: NodeJS.ProcessEnv,
  cwd?: string,
) => Promise<void>;

export type BuildDependencies = {
  command: Command;
  sync(): Promise<unknown>;
  environment: NodeJS.ProcessEnv;
};

export const build = async (
  destination = '.local/build/site',
  dependencies: BuildDependencies = {
    command,
    sync: syncFederation,
    environment: process.env,
  },
): Promise<void> => {
  await dependencies.sync();
  await dependencies.command('node', [
    '.config/scripts/prepare-svelte-assets.ts',
  ]);

  return dependencies.command(
    'pnpm',
    [
      '--dir',
      'website',
      'run',
      'build',
    ],
    {
      SITE_OUTPUT_DIR: resolve(destination),
      GITHUB_REPOSITORY:
        dependencies.environment.GITHUB_REPOSITORY || config.site.repository,
      GITHUB_SERVER_URL:
        dependencies.environment.GITHUB_SERVER_URL || 'https://github.com',
      GITHUB_SHA:
        dependencies.environment.LOBBY_SOURCE_SHA ||
        dependencies.environment.GITHUB_SHA ||
        '',
      GITHUB_RUN_ID: dependencies.environment.GITHUB_RUN_ID || '',
    },
  );
};

async function tests(): Promise<void> {
  await command('node', [
    '--test',
    '.config/scripts/check-stats.ts',
    '.config/scripts/check-public-resources.test.ts',
    '.config/scripts/check-pointer-sound.ts',
    '.config/scripts/check-link-view.ts',
    '.config/scripts/check-federation.ts',
    '.config/scripts/check-search.ts',
    '.config/scripts/check-code-spacing.test.ts',
    '.config/scripts/check-ci.test.ts',
    '.config/scripts/check-publish-stats.test.ts',
  ]);
}

async function secretScan(): Promise<void> {
  const secretScanPaths = [
    '.config',
    '.github',
    'website/src',
    'website/package.json',
    'website/pnpm-lock.yaml',
    'README.md',
    'justfile',
    'LICENSES',
  ];

  for (const path of secretScanPaths) {
    await command('gitleaks', [
      'dir',
      '--redact',
      '--no-banner',
      path,
    ]);
  }
}

async function security(): Promise<void> {
  await command('renovate-config-validator', [
    '--strict',
    '.github/renovate.json',
  ]);
  await command('node', [
    '.config/scripts/check-renovate.ts',
  ]);
  await command('node', [
    '.config/scripts/check-osv.ts',
  ]);
  await command('trivy', [
    'fs',
    '--no-progress',
    '--scanners',
    'vuln,secret',
    '--severity',
    'CRITICAL,HIGH',
    '--exit-code',
    '1',
    '--skip-dirs',
    '.git',
    '--skip-dirs',
    '.cache',
    '--skip-dirs',
    '.local',
    '--skip-dirs',
    '.config/node_modules',
    '--skip-dirs',
    '.config/audit/node_modules',
    '--skip-dirs',
    '.config/python/.venv',
    '--skip-dirs',
    'website/node_modules',
    '--skip-dirs',
    'website/.svelte-kit',
    '.',
  ]);

  for (const path of await dependencySBOMs()) {
    await command('trivy', [
      'sbom',
      '--no-progress',
      '--severity',
      'CRITICAL,HIGH',
      '--exit-code',
      '1',
      '--format',
      'json',
      '--output',
      path.replace('.cdx.json', '.trivy.json'),
      path,
    ]);
  }

  await command('semgrep', [
    'scan',
    '--config',
    'auto',
    '--error',
    '--exclude',
    'website/node_modules/**',
    '--exclude',
    'website/.svelte-kit/**',
    '--exclude',
    '.cache/**',
    '--exclude',
    '.local/**',
    'website/src',
    '.config/scripts',
  ]);
}

export type FastDependencies = {
  command: Command;
  secretScan(): Promise<void>;
  tests(): Promise<void>;
};

export async function checkFast(
  dependencies: FastDependencies = {
    command,
    secretScan,
    tests,
  },
): Promise<void> {
  await dependencies.command('pnpm', [
    '--dir',
    'website',
    'run',
    'format',
  ]);
  await dependencies.command('just', [
    '--fmt',
    '--check',
  ]);
  await dependencies.command('pnpm', [
    '--dir',
    'website',
    'run',
    'lint',
  ]);
  await dependencies.command('pnpm', [
    '--dir',
    'website',
    'run',
    'check',
  ]);
  await dependencies.command('actionlint');
  await dependencies.command('zizmor', [
    '--offline',
    '.github/workflows',
  ]);
  await dependencies.secretScan();
  await dependencies.tests();
}

function appearanceAudits(
  path: string,
  detailed: boolean = false,
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

async function check(): Promise<void> {
  if (process.env.TOOLING_PROFILE !== 'audit') {
    throw new Error('Use the workspace-audit Docker target for just check');
  }

  await checkFast();
  await security();
  await command('node', [
    '--test',
    '.config/scripts/check-raster-browser.ts',
  ]);
  await mkdir('.local/reports', {
    recursive: true,
  });
  await build('.local/build/qa');

  const pa11y = {
    defaults: structuredClone(pa11yDefaults.defaults),
    urls: [] as AccessibilityAudit[],
  };

  pa11y.urls = routes.flatMap((path): AccessibilityAudit[] => {
    return appearanceAudits(path);
  });

  const pageAudits = pa11y.urls.length;

  pa11y.urls.push(
    ...config.language_options.flatMap((language): AccessibilityAudit[] => {
      return [
        language.path,
        `${language.path}code/`,
      ].flatMap((path): AccessibilityAudit[] => {
        return appearanceAudits(path, true);
      });
    }),
  );
  pa11y.urls.push(
    ...config.language_options.flatMap(
      (
        language,
      ): {
        url: string;
        rootElement: string;
        actions: string[];
      }[] => {
        return [
          'dark',
          'light',
        ].map(
          (
            theme,
          ): {
            url: string;
            rootElement: string;
            actions: string[];
          } => {
            return {
              url: `http://127.0.0.1:4173${language.path}career/`,
              rootElement: '.profile-navigation',
              actions: [
                'click element [data-settings-open]',
                `click element label[for="theme-${theme}"]`,
                'click element #settings-dialog [data-dialog-close]',
              ],
            };
          },
        );
      },
    ),
    ...config.language_options.flatMap(
      (
        language,
      ): {
        url: string;
        actions: string[];
      }[] => {
        return [
          'dark',
          'light',
        ].flatMap(
          (
            theme,
          ): {
            url: string;
            actions: string[];
          }[] => {
            return [
              'settings',
              'credits',
            ].map(
              (
                dialog,
              ): {
                url: string;
                actions: string[];
              } => {
                const resolveActions = (): string[] => {
                  if (dialog === 'credits') {
                    return [
                      'click element #settings-dialog [data-dialog-close]',
                      'click element [data-credits-open]',
                    ];
                  }

                  return [];
                };

                return {
                  url: `http://127.0.0.1:4173${language.path}`,
                  actions: [
                    'click element [data-settings-open]',
                    `click element label[for="theme-${theme}"]`,
                    ...resolveActions(),
                  ],
                };
              },
            );
          },
        );
      },
    ),
  );
  await withServer(async (): Promise<void> => {
    await accessibilityViewports(
      pa11y.urls.slice(0, pageAudits + config.language_options.length * 6),
      pa11y.defaults,
    );
    await writeFile('.local/reports/pa11y.json', JSON.stringify(pa11y));
    await command('pa11y-ci', [
      '--config=.local/reports/pa11y.json',
    ]);
    await command(
      'node',
      [
        '.config/scripts/check-layout.ts',
      ],
      {
        QA_BASE_URL: 'http://127.0.0.1:4173',
        QA_REPORT_DIR: resolve('.local/reports'),
      },
    );
  });
  await build('.local/build/lighthouse');

  await command('node', [
    '.config/scripts/lighthouse-audit.ts',
  ]);
  await build();
  await command('node', [
    '.config/scripts/verify-links.ts',
  ]);
}

export async function runCI(
  validate: () => Promise<void> = checkFast,
  generate: () => Promise<void> = build,
): Promise<void> {
  await validate();
  await generate();
}

if (import.meta.main) {
  const task = process.argv[2];

  try {
    const formatScript = (): 'format' | 'format-fix' => {
      if (task === 'format') {
        return 'format';
      }

      return 'format-fix';
    };

    const justFormatArguments = (): string[] => {
      if (task === 'format') {
        return [
          '--check',
        ];
      }

      return [];
    };

    switch (task) {
      case 'dev':
        await syncFederation();
        await command('node', [
          '.config/scripts/prepare-svelte-assets.ts',
        ]);
        await command('pnpm', [
          '--dir',
          'website',
          'run',
          'dev',
        ]);
        break;

      case 'build':
        await build();
        break;

      case 'lighthouse-baseline':
        await build('.local/build/lighthouse-baseline');
        await command('node', [
          '.config/scripts/lighthouse-baseline.ts',
        ]);
        break;

      case 'preview':
        await command('serve', [
          '--no-clipboard',
          '--no-etag',
          '--listen',
          'tcp://0.0.0.0:4173',
          '.local/build/site',
        ]);
        break;

      case 'test':
        await tests();
        break;

      case 'check':
        await check();
        break;

      case 'check-fast':
        await checkFast();
        break;

      case 'ci':
        await runCI();
        break;

      case 'format':
      case 'format-fix':
        await command('pnpm', [
          '--dir',
          'website',
          'run',
          formatScript(),
        ]);
        await command('just', [
          '--fmt',
          ...justFormatArguments(),
        ]);
        break;

      default:
        throw new Error('Unknown task');
    }
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}
