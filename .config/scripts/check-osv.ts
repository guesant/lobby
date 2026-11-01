import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dependencySBOMs } from './security-inputs.ts';
import { resolve } from 'node:path';
import {
  array,
  record,
  requiredText,
  strings,
} from '../../website/src/lib/validation-primitives.ts';

type Advisory = {
  name: string;
  version: string;
  ids: string[];
  severity: string | number;
};

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
  const ids = strings(group.ids, 'OSV advisory identifiers');

  let rating = -1;

  for (const raw of array(entry.vulnerabilities || [], 'OSV vulnerabilities')) {
    const vulnerability = record(raw, 'OSV vulnerability');

    if (
      typeof vulnerability.id !== 'string' ||
      !ids.includes(vulnerability.id)
    ) {
      continue;
    }

    const level = record(
      vulnerability.database_specific,
      'OSV database rating',
    ).severity;

    const position = levels.findIndex((candidate): boolean => {
      return candidate === level;
    });

    if (position < 0) {
      throw new Error(`Missing OSV severity: ${vulnerability.id}`);
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
  const value = group.max_severity;

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

  return array(report.results, 'OSV results')
    .flatMap((value): Advisory[] => {
      const result = record(value, 'OSV result');

      return array(result.packages, 'OSV packages')
        .flatMap(
          (value): Advisory[] => {
            const entry = record(value, 'OSV package entry');

            const dependency = record(entry.package, 'OSV package identity');

            return array(entry.groups || [], 'OSV advisory groups')
              .map(
                (value): Advisory => {
                  const group = record(value, 'OSV advisory group');

                  const severity = advisorySeverity(group, entry);

                  return {
                    name: requiredText(dependency.name, 'OSV package name'),
                    version: requiredText(dependency.version, 'OSV package version'),
                    ids: strings(group.ids, 'OSV advisory identifiers'),
                    severity,
                  };
                },
              );
          },
        );
    });
}

export function blockingAdvisories(report: unknown): Advisory[] {
  return reportedAdvisories(report)
    .filter(blocking);
}

export function assertSourceCoverage(value: unknown, expected: string[]): void {
  const report = record(value, 'OSV report');

  const paths = new Set(
    array(report.results, 'OSV results')
      .map((raw): string => {
        const source = record(record(raw, 'OSV result').source, 'OSV source');

        return resolve(requiredText(source.path, 'OSV source path'));
      }),
  );

  for (const path of expected) {
    if (!paths.has(resolve(path))) {
      throw new Error(`OSV omitted a native SBOM: ${path}`);
    }
  }
}

async function runScanner(): Promise<{
  code: number;
  output: string;
  paths: string[];
}> {
  const paths = await dependencySBOMs();

  return new Promise<{
    code: number;
    output: string;
    paths: string[];
  }>((resolve, reject): void => {
    const output: Buffer[] = [];

    const scanner = spawn(
      'osv-scanner',
      [
        'scan',
        'source',
        '--experimental-plugins',
        'sbom',
        '--lockfile',
        '.config/pnpm-lock.yaml',
        '--lockfile',
        'website/pnpm-lock.yaml',
        '--lockfile',
        '.config/audit/pnpm-lock.yaml',
        '--lockfile',
        '.config/python/uv.lock',
        ...paths.flatMap((path): string[] => {
          return [
            '--lockfile',
            path,
          ];
        }),
        '--all-packages',
        '--format',
        'json',
      ],
      {
        stdio: [
          'ignore',
          'pipe',
          'inherit',
        ],
      },
    );

    scanner.stdout.on('data', (chunk: Buffer): void => {
      output.push(chunk);
    });
    scanner.on('error', reject);
    scanner.on('close', (code, signal): void => {
      if (code === null) {
        reject(new Error(`osv-scanner terminated: ${signal}`));

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
  const result = await runScanner();

  if (result.code !== 0 && result.code !== 1) {
    throw new Error(`osv-scanner failed: ${result.code}`);
  }

  const report: unknown = JSON.parse(result.output);

  assertSourceCoverage(report, result.paths);

  await mkdir('.local/reports', {
    recursive: true,
  });
  await writeFile('.local/reports/osv.json', result.output);

  const findings = blockingAdvisories(report);

  for (const advisory of reportedAdvisories(report)) {
    if (!blocking(advisory)) {
      console.warn(
        `OSV below HIGH threshold: ${advisory.name}@${advisory.version} ${advisory.ids.join(
          ', ',
        )} (${advisory.severity})`,
      );
    }
  }

  if (findings.length) {
    console.error('OSV found HIGH or CRITICAL vulnerabilities:');

    for (const advisory of findings) {
      console.error(
        `${advisory.name}@${advisory.version} ${advisory.ids.join(
          ', ',
        )} (${advisory.severity})`,
      );
    }

    process.exitCode = 1;
  }
}

if (import.meta.main) {
  await main();
}
