import { runCommand } from '../process.ts';
import type { FormFactor, LighthouseResult } from './lighthouse-audit.types.ts';
import { lighthouseConfiguration } from './lighthouse-configuration.ts';
import { lighthouseResult } from './lighthouse-result.ts';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function runLighthouse(
  url: string,
  output: string,
  formFactor: FormFactor = 'mobile',
): Promise<LighthouseResult> {
  const configuration = lighthouseConfiguration();

  const outputDirectory = dirname(output);

  await mkdir(outputDirectory, {
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

  const reportText = await readFile(`${output}.report.json`, 'utf8');

  const parsed: unknown = JSON.parse(reportText);

  return lighthouseResult(parsed);
}
