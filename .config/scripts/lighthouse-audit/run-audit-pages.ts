import type { readConfiguration } from '../configuration.ts';
import { assertLighthouse } from './assert-lighthouse.ts';
import { auditPageURLs } from './audit-page-urls.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { runHomepageLighthouse } from './run-homepage-lighthouse.ts';
import { runLighthouse } from './run-lighthouse.ts';
import { resolve } from 'node:path';

export async function runAuditPages(
  data: ReturnType<typeof readConfiguration>,
  results: LighthouseResult[],
): Promise<void> {
  const urls = auditPageURLs(data);

  for (const [
    index,
    path,
  ] of urls.entries()) {
    const reportIndex = String(index)
      .padStart(2, '0');

    const output = resolve('.cache/lighthouseci/reports', reportIndex);

    const url = `http://127.0.0.1:4173${path}`;

    let measure = runLighthouse;

    if (path.indexOf('/', 1) === path.length - 1) {
      measure = runHomepageLighthouse;
    }

    const result = await measure(url, output);

    results.push(result);

    const serializedResult = JSON.stringify(result);

    console.log(serializedResult);
    assertLighthouse(result);
  }
}
