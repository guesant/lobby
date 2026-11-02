import { runCommand as command } from './process.ts';
import type { Linter } from 'eslint';
import { ESLint } from 'eslint';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as prettier from 'prettier';

let layoutFormatter: ESLint | undefined;

function formattingFix(message: Linter.LintMessage): boolean {
  const rule = message.ruleId ?? '';

  return (
    rule.startsWith('@stylistic/') ||
    rule.startsWith('simple-import-sort/') ||
    [
      'import-x/first',
      'svelte/indent',
      'lobby/multiline-structures',
      'lobby/svelte-top-level-spacing',
      'lobby/svelte-import-first',
      'lobby/block-directive-newline',
    ].includes(rule)
  );
}

function knipWorkspaceArguments(): string[] {
  if (process.env['TOOLING_PROFILE'] === 'audit') {
    return [];
  }

  return [
    '--workspace',
    '.',
    '--workspace',
    '../.config',
  ];
}

async function sourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];

  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    if (
      [
        'node_modules',
        '.git',
        '.local',
        '.cache',
        '.svelte-kit',
        '.venv',
        '.pnpm-store',
      ].includes(entry.name)
    ) {
      continue;
    }

    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(path)));
    } else if (
      /\.(?:[cm]?[jt]s|svelte|css|jsonc?|ya?ml|md|html)$/.test(entry.name) &&
      !entry.name.includes('lock')
    ) {
      files.push(path);
    }
  }

  return files;
}

export async function canonicalFormat(
  source: string,
  filePath: string,
): Promise<string> {
  const options = await prettier.resolveConfig(filePath, {
    config: resolve('website/prettier.config.js'),
  });

  if (!/\.(?:[cm]?[jt]s|svelte)$/.test(filePath)) {
    return prettier.format(source, {
      ...options,
      filepath: filePath,
    });
  }

  layoutFormatter ??= new ESLint({
    overrideConfigFile: resolve('website/eslint.config.js'),
    fix: formattingFix,
  });

  let current = source;

  for (let pass = 0; pass < 5; pass += 1) {
    const formatted = await prettier.format(current, {
      ...options,
      filepath: filePath,
    });

    const [
      result,
    ] = await layoutFormatter.lintText(formatted, {
      filePath,
    });

    const output = formattingOutput(result, formatted, filePath);

    if (output === current) {
      return output;
    }

    current = output;
  }

  throw new Error(`Canonical formatting did not converge: ${filePath}`);
}

function formattingOutput(
  result: ESLint.LintResult | undefined,
  formatted: string,
  filePath: string,
): string {
  if (!result || result.fatalErrorCount) {
    throw new Error(
      `Cannot format ${filePath}: ${JSON.stringify(result?.messages)}`,
    );
  }

  return result.output ?? formatted;
}

async function format(fix: boolean): Promise<void> {
  const failures: string[] = [];

  for (const path of await sourceFiles(process.cwd())) {
    const source = await readFile(path, 'utf8');

    const output = await canonicalFormat(source, path);

    if (source === output) {
      continue;
    }

    if (fix) {
      await writeFile(path, output);
    } else {
      failures.push(path);
    }
  }

  if (failures.length) {
    throw new Error(`Formatting required:\n${failures.join('\n')}`);
  }
}

async function main(): Promise<void> {
  const operation = process.argv[2];

  if (operation === 'format' || operation === 'format-fix') {
    await format(operation === 'format-fix');

    return;
  }

  if (operation === 'lint-fix') {
    await command('eslint', [
      '--config',
      'website/eslint.config.js',
      '.',
      '--fix',
    ]);

    return;
  }

  if (operation !== 'lint') {
    throw new Error('Unknown quality operation');
  }

  await lintCode();
  await lintContracts();
}

async function lintCode(): Promise<void> {
  await command('eslint', [
    '--config',
    'website/eslint.config.js',
    '.',
    '--max-warnings',
    '0',
  ]);
  await command(
    'knip',
    [
      '--config',
      '../.config/knip.json',
      '--treat-config-hints-as-errors',
      ...knipWorkspaceArguments(),
    ],
    {
      environment: {},
      cwd: resolve('website'),
    },
  );
}

async function lintContracts(): Promise<void> {
  await command('node', [
    '.config/scripts/repository-quality.ts',
  ]);
  await command('node', [
    '.config/scripts/module-boundaries.ts',
  ]);
  await command('tsc', [
    '--project',
    '.config/tsconfig.json',
  ]);
  await command('pnpm', [
    '--dir',
    '.config',
    'run',
    'duplicates',
  ]);
  await command('stylelint', [
    '--config',
    'website/.stylelintrc.json',
    'website/src/assets/css/*.css',
  ]);
}

if (import.meta.main) {
  await main();
}
