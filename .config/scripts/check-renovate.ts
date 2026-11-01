import { spawn } from 'node:child_process';
import { mkdir, writeFile, mkdtemp, cp, rm, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/validation-primitives.ts';
import {
  dependencyInventory,
  type ManagedDependency,
} from './dependency-inventory.ts';

function extractFile(
  value: unknown,
  extracted: Map<string, Set<string>>,
): void {
  const file = record(value, 'Renovate file');

  const path = requiredText(file.packageFile, 'Renovate package file');

  const names = extracted.get(path) || new Set<string>();

  for (const rawDependency of array(file.deps || [], 'Renovate dependencies')) {
    const dependency = record(rawDependency, 'Renovate dependency');

    if (
      dependency.skipReason === 'unversioned-reference' ||
      dependency.enabled === false
    ) {
      throw new Error(
        `Renovate cannot update dependency in ${path}: ${String(dependency.depName)}`,
      );
    }

    if (typeof dependency.depName === 'string') {
      names.add(dependency.depName);
    }
  }

  extracted.set(path, names);
}

export function extractedDependencies(
  output: string,
): Map<string, Set<string>> {
  const extracted = new Map<string, Set<string>>();

  let found = false;

  for (const line of output.split('\n')
    .filter(Boolean)) {
    const message = record(JSON.parse(line) as unknown, 'Renovate log record');

    if (message.msg !== 'Extracted dependencies') {
      continue;
    }

    found = true;

    for (const files of Object.values(
      record(message.packageFiles, 'Renovate package files'),
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
        reject(new Error(`Renovate extraction failed: ${code ?? signal}`));

        return;
      }

      accept(Buffer.concat(chunks)
        .toString('utf8'));
    });
  });
}

export async function checkRenovate(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'lobby-renovate-'));

  let output: string;

  try {
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
    if (!extracted.get(dependency.file)
      ?.has(dependency.name)) {
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
    `Renovate extracted all ${inventory.length} declared dependencies`,
  );
}

if (import.meta.main) {
  await checkRenovate();
}
