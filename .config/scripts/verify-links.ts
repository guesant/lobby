import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

type LinkFailure = {
  url: string;
  status: {
    code: number;
  };
};

type VerifiedLink = {
  url: string;
  status: number;
  method: string;
};

type LinkRequester = (url: string, options: RequestInit) => Promise<Response>;

function reportFailures(report: Record<string, unknown>): LinkFailure[] {
  return Object.values(
    record(report['error_map'] ?? {}, 'link errors'),
  )
    .flatMap((entry): LinkFailure[] => {
      return array(entry, 'link failures')
        .map((value): LinkFailure => {
          const failure = record(value, 'link failure');

          const code = record(failure['status'], 'link failure status')['code'];

          if (typeof code !== 'number') {
            throw new Error('Invalid link status');
          }

          return {
            url: requiredText(failure['url'], 'link failure URL'),
            status: {
              code,
            },
          };
        });
    });
}

export async function verifyTransientFailures(
  value: unknown,
  request: LinkRequester = fetch,
): Promise<VerifiedLink[]> {
  const report = record(value, 'link report');

  const failures = reportFailures(report);

  if (!failures.length && !report['errors']) {
    return [];
  }

  const transient = new Set([
    429,
    500,
    502,
    503,
    504,
  ]);

  if (
    !failures.length ||
    failures.some((entry): boolean => {
      return !transient.has(entry.status.code);
    })
  ) {
    throw new Error('Link validation contains non-retriable errors');
  }

  const verified: VerifiedLink[] = [];

  for (const url of new Set(
    failures.map((entry): string => {
      return entry.url;
    }),
  )) {
    verified.push(await requestValidLink(url, request));
  }

  return verified;
}

async function requestValidLink(
  url: string,
  request: LinkRequester,
): Promise<VerifiedLink> {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Invalid retry URL');
  }

  const response = await request(url, {
    method: 'GET',
    signal: AbortSignal.timeout(20000),
    headers: {
      'User-Agent': 'links-validation',
    },
  });

  await response.body?.cancel();

  if (!response.ok) {
    throw new Error(
      `Link retry failed: HTTP ${String(response.status)} ${url}`,
    );
  }

  return {
    url,
    status: response.status,
    method: 'GET',
  };
}

async function runLinkChecker(
  reportPath: string,
): Promise<ReturnType<typeof spawnSync>> {
  const cacheDirectory = resolve('.cache/lychee');

  const configPath = resolve('.config/lychee.toml');

  const publicPath = resolve('.local/build/site');

  await mkdir(cacheDirectory, {
    recursive: true,
  });
  await mkdir('.local/reports', {
    recursive: true,
  });
  await writeFile(reportPath, '');

  return spawnSync(
    'lychee',
    [
      '--config',
      configPath,
      '--root-dir',
      publicPath,
      '--format',
      'json',
      '--output',
      reportPath,
      publicPath,
    ],
    {
      cwd: cacheDirectory,
      stdio: 'inherit',
    },
  );
}

async function main(): Promise<void> {
  const reportPath = resolve('.local/reports/links.json');

  const result = await runLinkChecker(reportPath);

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && result.status !== 2) {
    throw new Error(`Link checker failed: ${String(result.status)}`);
  }

  const report = record(
    JSON.parse(await readFile(reportPath, 'utf8')) as unknown,
    'link report',
  );

  if (
    typeof report['unique'] !== 'number' ||
    !Number.isInteger(report['unique']) ||
    report['unique'] < 0
  ) {
    throw new Error('Invalid link report count');
  }

  let verified: VerifiedLink[] = [];

  if (result.status !== 0) {
    await setTimeout(2000);
    verified = await verifyTransientFailures(report);
  }

  await writeFile(
    '.local/reports/link-retries.json',
    JSON.stringify(
      {
        verified,
        checked_at: new Date()
          .toISOString(),
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      unique: report['unique'],
      errors: 0,
      verified_retries: verified,
    }),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main()
    .catch((error: unknown): void => {
      console.error(String(error));
      process.exitCode = 1;
    });
}
