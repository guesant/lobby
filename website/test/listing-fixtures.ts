import { readConfiguration } from '../../.config/scripts/configuration.ts';
import { websiteRoot } from '../../.config/scripts/paths.ts';
import { resolveDestination } from '../src/lib/features/content/content.model.ts';
import type {
  EditorialRecord,
  LinkRecord,
} from '../src/lib/features/content/content.types.ts';
import {
  record,
  requiredText,
} from '../src/lib/features/content/validation.model.ts';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  createServer,
  isRunnableDevEnvironment,
  type ViteDevServer,
} from 'vite';
import type { ModuleRunner } from 'vite/module-runner';

const execute = promisify(execFile);

function fixtureRunner(server: ViteDevServer): ModuleRunner {
  const environment = server.environments.ssr;

  if (!isRunnableDevEnvironment(environment)) {
    throw new Error('The fixture requires a runnable Vite SSR environment');
  }

  return environment.runner;
}

function informativeProps(
  locale: string,
  interfaceName: string,
): Record<string, unknown> {
  const config = readConfiguration();

  const localized = config.locales[locale];

  if (
    !localized ||
    (interfaceName !== 'minecraft' && interfaceName !== 'terminal')
  ) {
    throw new Error('Invalid listing fixture locale or interface');
  }

  const item: EditorialRecord = {
    id: 'test-information',
    type: 'uses',
    source: 'lobby',
    language: locale,
    title: 'Informational test fixture',
    summary: 'Test-only description',
    url: '',
    tags: [],
    metadata: {},
  };

  return {
    item,
    ui: {},
    thirdPartyLabel: localized.ui.third_party,
    locale,
    interfaceName,
    sectionID: 'uses',
    headingLevel: 3,
    destination(
      link: Pick<LinkRecord, 'url' | 'target'>,
    ): ReturnType<typeof resolveDestination> {
      return resolveDestination(config.site, link);
    },
  };
}

async function renderInformativeRecord(
  locale: string,
  interfaceName: string,
): Promise<string> {
  const server = await createServer({
    root: websiteRoot,
    logLevel: 'silent',
    server: {
      middlewareMode: true,
      hmr: false,
      watch: null,
    },
  });

  try {
    const runner = fixtureRunner(server);

    const loaded: unknown = await runner.import(
      '/src/lib/components/EditorialEntry.svelte',
    );

    const renderer: unknown = await runner.import('svelte/server');

    const component = record(loaded, 'fixture component')['default'];

    const render = record(renderer, 'fixture renderer')['render'];

    if (typeof component !== 'function' || typeof render !== 'function') {
      throw new Error('Invalid Svelte fixture renderer');
    }

    const result: unknown = Reflect.apply(render, undefined, [
      component,
      {
        props: informativeProps(locale, interfaceName),
      },
    ]);

    return requiredText(
      record(result, 'rendered fixture')['body'],
      'fixture HTML',
    );
  } finally {
    await server.close();
  }
}

export async function informativeRecordFixture(
  locale: string,
  interfaceName: string | undefined,
): Promise<string> {
  const selected = requiredText(interfaceName, 'fixture interface');

  const directory = await mkdtemp(join(tmpdir(), 'lobby-listing-'));

  const output = join(directory, 'record.html');

  try {
    await execute(
      process.execPath,
      [
        fileURLToPath(import.meta.url),
        locale,
        selected,
        output,
      ],
      {
        cwd: websiteRoot,
      },
    );

    return await readFile(output, 'utf8');
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
}

if (import.meta.main) {
  const locale = requiredText(process.argv[2], 'fixture locale');

  const interfaceName = requiredText(process.argv[3], 'fixture interface');

  const output = requiredText(process.argv[4], 'fixture output');

  await writeFile(output, await renderInformativeRecord(locale, interfaceName));
}
