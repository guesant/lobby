import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import {
  dependencyInventory,
  type ManagedDependency,
} from './dependency-inventory.ts';
import { execFileSync, spawn } from 'node:child_process';
import { cp, lstat, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

type ExtractedDependency = {
  name: string;
  version: string | undefined;
  digest: string | undefined;
};

function extractedValue(
  dependency: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = dependency[key];

  if (value === undefined) {
    return undefined;
  }

  return requiredText(value, `Renovate ${key}`);
}

function extractFile(
  value: unknown,
  extracted: Map<string, ExtractedDependency[]>,
): void {
  const file = record(value, 'Renovate file');

  const path = requiredText(file['packageFile'], 'Renovate package file');

  const dependencies = extracted.get(path) ?? [];

  for (const rawDependency of array(
    file['deps'] ?? [],
    'Renovate dependencies',
  )) {
    const dependency = record(rawDependency, 'Renovate dependency');

    if (
      dependency['skipReason'] === 'unversioned-reference' ||
      dependency['enabled'] === false
    ) {
      throw new Error(
        `Renovate cannot update dependency in ${path}: ${String(dependency['depName'])}`,
      );
    }

    if (typeof dependency['depName'] === 'string') {
      dependencies.push({
        name: dependency['depName'],
        version: extractedValue(dependency, 'currentValue'),
        digest: extractedValue(dependency, 'currentDigest'),
      });
    }
  }

  extracted.set(path, dependencies);
}

export function extractedDependencies(
  output: string,
): Map<string, ExtractedDependency[]> {
  const extracted = new Map<string, ExtractedDependency[]>();

  let found = false;

  for (const line of output.split('\n')
    .filter(Boolean)) {
    const message = record(JSON.parse(line) as unknown, 'Renovate log record');

    if (message['msg'] !== 'Extracted dependencies') {
      continue;
    }

    found = true;

    for (const files of Object.values(
      record(message['packageFiles'], 'Renovate package files'),
    )) {
      for (const rawFile of array(files, 'Renovate manager files')) {
        extractFile(rawFile, extracted);
      }
    }
  }

  if (!found || !extracted.size) {
    throw new Error('Renovate did not report an interpretable extraction');
  }

  return extracted;
}

export function hasManagedDependency(
  extracted: Map<string, ExtractedDependency[]>,
  dependency: ManagedDependency,
): boolean {
  return (
    extracted.get(dependency.file)
      ?.some((entry): boolean => {
        return (
          entry.name === dependency.name &&
        (!dependency.digest ||
          (entry.version === dependency.version &&
            entry.digest === dependency.digest))
        );
      }) ?? false
  );
}

async function extraction(cwd: string): Promise<string> {
  return new Promise((accept, reject): void => {
    const chunks: Buffer[] = [];

    const child = spawn(
      'renovate',
      [
        '--platform=local',
        '--dry-run=extract',
        '--onboarding=false',
      ],
      {
        cwd,
        env: {
          ...process.env,
          LOG_FORMAT: 'json',
          LOG_LEVEL: 'debug',
        },
        stdio: [
          'ignore',
          'pipe',
          'inherit',
        ],
      },
    );

    child.stdout.on('data', (chunk: Buffer): void => {
      chunks.push(chunk);
    });
    child.on('error', reject);
    child.on('close', (code, signal): void => {
      if (code !== 0) {
        reject(
          new Error(`Renovate extraction failed: ${String(code ?? signal)}`),
        );

        return;
      }

      accept(Buffer.concat(chunks)
        .toString('utf8'));
    });
  });
}

async function copyRepository(directory: string): Promise<void> {
  const files = execFileSync(
    'git',
    [
      'ls-files',
      '--cached',
      '--others',
      '--exclude-standard',
      '-z',
    ],
    {
      encoding: 'utf8',
    },
  )
    .split('\0')
    .filter(Boolean);

  for (const file of new Set(files)) {
    const status = await lstat(file)
      .catch((error: unknown): undefined => {
        if (
          error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
        ) {
          return undefined;
        }

        throw error;
      });

    if (!status?.isFile()) {
      continue;
    }

    const target = join(directory, file);

    await mkdir(dirname(target), {
      recursive: true,
    });
    await cp(file, target);
  }
}

export async function checkRenovate(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'lobby-renovate-'));

  let output: string;

  try {
    await copyRepository(directory);
    output = await extraction(directory);
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }

  await mkdir('.local/reports', {
    recursive: true,
  });
  await writeFile('.local/reports/renovate-extraction.jsonl', output);

  const extracted = extractedDependencies(output);

  const inventory: ManagedDependency[] = await dependencyInventory();

  for (const dependency of inventory) {
    if (!hasManagedDependency(extracted, dependency)) {
      throw new Error(
        `Dependency not extracted by Renovate: ${dependency.file}: ${dependency.name}`,
      );
    }
  }

  await writeFile(
    '.local/reports/dependency-inventory.json',
    JSON.stringify(inventory, null, 2),
  );
  console.log(
    `Renovate extracted all ${String(inventory.length)} declared dependencies`,
  );
}

if (import.meta.main) {
  await checkRenovate();
}
