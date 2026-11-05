import {
  array,
  record,
  requiredText,
  strings,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { Advisory } from './check-osv.types.ts';
import { runSarifCommand } from './run-sarif-command.ts';
import { annotateSarif } from './sarif.ts';
import { dependencySBOMs } from './security-inputs.ts';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const levels = [
  'LOW',
  'MODERATE',
  'HIGH',
  'CRITICAL',
] as const;

function unratedSeverity(
  group: Record<string, unknown>,
  entry: Record<string, unknown>,
): string {
  const ids = strings(group['ids'], 'OSV advisory identifiers');

  let rating = -1;

  for (const raw of array(
    entry['vulnerabilities'] ?? [],
    'OSV vulnerabilities',
  )) {
    const vulnerability = record(raw, 'OSV vulnerability');

    if (
      typeof vulnerability['id'] !== 'string' ||
      !ids.includes(vulnerability['id'])
    ) {
      continue;
    }

    const level = record(
      vulnerability['database_specific'],
      'OSV database rating',
    )['severity'];

    const position = levels.findIndex((candidate): boolean => {
      return candidate === level;
    });

    if (position < 0) {
      throw new Error(`Missing OSV severity: ${vulnerability['id']}`);
    }

    rating = Math.max(rating, position);
  }

  const level = levels[rating];

  if (!level) {
    throw new Error('Missing OSV advisory severity');
  }

  return level;
}

function advisorySeverity(
  group: Record<string, unknown>,
  entry: Record<string, unknown>,
): string | number {
  const value = group['max_severity'];

  if (value === '') {
    return unratedSeverity(group, entry);
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error('Missing OSV advisory severity');
  }

  const score = Number(value);

  if (!Number.isFinite(score) || score < 0 || score > 10) {
    throw new Error('Invalid OSV advisory severity');
  }

  return score;
}

function blocking(advisory: Advisory): boolean {
  if (typeof advisory.severity === 'number') {
    return advisory.severity >= 7;
  }

  return advisory.severity === 'HIGH' || advisory.severity === 'CRITICAL';
}

export function reportedAdvisories(value: unknown): Advisory[] {
  const report = record(value, 'OSV report');

  return array(report['results'], 'OSV results')
    .flatMap(
      (value): Advisory[] => {
        const result = record(value, 'OSV result');

        function packageAdvisories(value: unknown): Advisory[] {
          const entry = record(value, 'OSV package entry');

          const dependency = record(entry['package'], 'OSV package identity');

          return array(entry['groups'] ?? [], 'OSV advisory groups')
            .map(
              (value): Advisory => {
                const group = record(value, 'OSV advisory group');

                const severity = advisorySeverity(group, entry);

                return {
                  name: requiredText(dependency['name'], 'OSV package name'),
                  version: requiredText(
                    dependency['version'],
                    'OSV package version',
                  ),
                  ids: strings(group['ids'], 'OSV advisory identifiers'),
                  severity,
                };
              },
            );
        }

        return array(result['packages'], 'OSV packages')
          .flatMap(
            packageAdvisories,
          );
      },
    );
}

export function blockingAdvisories(report: unknown): Advisory[] {
  return reportedAdvisories(report)
    .filter(blocking);
}

export function assertSourceCoverage(value: unknown, expected: string[]): void {
  const report = record(value, 'OSV report');

  const paths = new Set(
    array(report['results'], 'OSV results')
      .map((raw): string => {
        const source = record(record(raw, 'OSV result')['source'], 'OSV source');

        return resolve(requiredText(source['path'], 'OSV source path'));
      }),
  );

  for (const path of expected) {
    if (!paths.has(resolve(path))) {
      throw new Error(`OSV omitted a native SBOM: ${path}`);
    }
  }
}

function scannerArguments(paths: string[], format: 'json' | 'sarif'): string[] {
  const files = [
    '.config/pnpm-lock.yaml',
    'website/pnpm-lock.yaml',
    '.config/audit/pnpm-lock.yaml',
    '.config/python/uv.lock',
    ...paths,
  ];

  return [
    'scan',
    'source',
    '--experimental-plugins',
    'sbom',
    ...files.flatMap((path): string[] => {
      return [
        '--lockfile',
        path,
      ];
    }),
    '--all-packages',
    '--format',
    format,
  ];
}

async function runScanner(paths: string[]): Promise<{
  code: number;
  output: string;
  paths: string[];
}> {
  return new Promise<{
    code: number;
    output: string;
    paths: string[];
  }>((resolve, reject): void => {
    const output: Buffer[] = [];

    const scanner = spawn('osv-scanner', scannerArguments(paths, 'json'), {
      stdio: [
        'ignore',
        'pipe',
        'inherit',
      ],
    });

    scanner.stdout.on('data', (chunk: Buffer): void => {
      output.push(chunk);
    });
    scanner.on('error', reject);
    scanner.on('close', (code, signal): void => {
      if (code === null) {
        reject(new Error(`osv-scanner terminated: ${String(signal)}`));

        return;
      }

      resolve({
        code,
        paths,
        output: Buffer.concat(output)
          .toString('utf8'),
      });
    });
  });
}

async function main(): Promise<void> {
  const paths = await dependencySBOMs();

  const result = await runScanner(paths);

  if (result.code !== 0 && result.code !== 1) {
    throw new Error(`osv-scanner failed: ${String(result.code)}`);
  }

  const report: unknown = JSON.parse(result.output);

  assertSourceCoverage(report, result.paths);

  await mkdir('.local/reports', {
    recursive: true,
  });
  await writeFile('.local/reports/osv.json', result.output);

  const sarifPath = '.local/reports/sarif/osv.sarif';

  const sarifCode = await runSarifCommand(
    'osv-scanner',
    scannerArguments(paths, 'sarif'),
    sarifPath,
  );

  if (sarifCode !== result.code) {
    throw new Error('OSV JSON and SARIF scans returned different statuses');
  }

  await annotateSarif(sarifPath, 'osv/dependencies');

  const findings = blockingAdvisories(report);

  reportAdvisories(report, findings);
}

function reportAdvisories(report: unknown, findings: Advisory[]): void {
  for (const advisory of reportedAdvisories(report)) {
    if (!blocking(advisory)) {
      console.warn(
        `OSV below HIGH threshold: ${advisory.name}@${advisory.version} ${advisory.ids.join(
          ', ',
        )} (${String(advisory.severity)})`,
      );
    }
  }

  if (findings.length) {
    console.error('OSV found HIGH or CRITICAL vulnerabilities:');

    for (const advisory of findings) {
      console.error(
        `${advisory.name}@${advisory.version} ${advisory.ids.join(
          ', ',
        )} (${String(advisory.severity)})`,
      );
    }

    process.exitCode = 1;
  }
}

if (import.meta.main) {
  await main();
}
