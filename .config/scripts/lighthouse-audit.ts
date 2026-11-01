import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import configuration from '../lighthouserc.json' with { type: 'json' };
import { record } from '../../website/src/lib/validation-primitives.ts';
import { readConfiguration, pagesFor } from './configuration.ts';
import { runCommand } from './process.ts';
import { withStaticServer } from './static-server.ts';

export type FormFactor = 'mobile' | 'desktop';

export type LighthouseResult = {
  path: string;
  formFactor: FormFactor;
  scores: Record<string, number>;
};

export function lighthouseThresholds(): Record<string, number> {
  const thresholds: Record<string, number> = {};

  for (const [
    key,
    assertion,
  ] of Object.entries(configuration.ci.assert.assertions)) {
    if (assertion === 'off') {
      continue;
    }

    if (!Array.isArray(assertion) || assertion[0] !== 'error') {
      throw new Error(`Invalid Lighthouse assertion: ${key}`);
    }

    const threshold = record(assertion[1], 'Lighthouse threshold').minScore;

    if (
      typeof threshold !== 'number' ||
      !Number.isFinite(threshold) ||
      threshold < 0 ||
      threshold > 1
    ) {
      throw new Error(`Invalid Lighthouse threshold: ${key}`);
    }

    thresholds[key.replace('categories:', '')] = threshold;
  }

  return thresholds;
}

export function lighthouseResult(value: unknown): LighthouseResult {
  const report = record(value, 'Lighthouse result');

  if (report.runtimeError) {
    throw new Error(
      `Lighthouse runtime error: ${JSON.stringify(report.runtimeError)}`,
    );
  }

  const settings = record(report.configSettings, 'Lighthouse settings');

  if (settings.formFactor !== 'mobile' && settings.formFactor !== 'desktop') {
    throw new Error('Invalid Lighthouse form factor');
  }

  if (typeof report.finalUrl !== 'string') {
    throw new Error('Missing Lighthouse URL');
  }

  const categories = record(report.categories, 'Lighthouse categories');

  const scores: Record<string, number> = {};

  for (const key of Object.keys(lighthouseThresholds())) {
    const score = record(categories[key], `Lighthouse ${key}`).score;

    if (
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 1
    ) {
      throw new Error(`Invalid Lighthouse score: ${key}`);
    }

    scores[key] = score;
  }

  return {
    path: new URL(report.finalUrl).pathname,
    formFactor: settings.formFactor,
    scores,
  };
}

export function assertLighthouse(result: LighthouseResult): void {
  for (const [
    key,
    threshold,
  ] of Object.entries(lighthouseThresholds())) {
    const score = result.scores[key];

    if (score === undefined || score < threshold) {
      throw new Error(
        `Lighthouse ${result.formFactor} ${result.path} ${key}: ${score}, minimum ${threshold}`,
      );
    }
  }
}

export async function runLighthouse(
  url: string,
  output: string,
  formFactor: FormFactor = 'mobile',
): Promise<LighthouseResult> {
  await mkdir(dirname(output), {
    recursive: true,
  });

  const options = [
    '--output=json',
    '--output=html',
    `--output-path=${output}`,
    `--chrome-flags=--headless ${configuration.ci.collect.settings.chromeFlags}`,
    '--quiet',
  ];

  if (formFactor === 'desktop') {
    options.push('--preset=desktop');
  }

  await runCommand('lighthouse', [
    url,
    ...options,
  ]);

  return lighthouseResult(
    JSON.parse(await readFile(`${output}.report.json`, 'utf8')) as unknown,
  );
}

async function main(): Promise<void> {
  const data = readConfiguration();

  const results: LighthouseResult[] = [];

  await withStaticServer(async (): Promise<void> => {
    for (const language of data.language_options) {
      for (const page of pagesFor(data, language.id)
        .filter(
          (entry): boolean => {
            return !entry.fallback;
          },
        )) {
        const output = resolve(
          '.cache/lighthouseci/reports',
          language.id,
          page.id,
        );

        const result = await runLighthouse(
          `http://127.0.0.1:4173${page.url}`,
          output,
        );

        results.push(result);
        console.log(JSON.stringify(result));
        assertLighthouse(result);
      }
    }
  }, '.local/build/lighthouse');
  await writeFile(
    '.cache/lighthouseci/results.json',
    JSON.stringify(results, null, 2),
  );
}

if (import.meta.main) {
  await main();
}
