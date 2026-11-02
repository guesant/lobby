import type { readConfiguration } from '../configuration.ts';
import { pagesFor } from '../configuration.ts';
import { assertLighthouse } from './assert-lighthouse.ts';
import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { runLighthouse } from './run-lighthouse.ts';
import { resolve } from 'node:path';

export async function runAuditPages(
  data: ReturnType<typeof readConfiguration>,
  results: LighthouseResult[],
): Promise<void> {
  for (const language of data.language_options) {
    for (const page of pagesFor(data, language.id)) {
      if (page.fallback) {
        continue;
      }

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

      const serializedResult = JSON.stringify(result);

      console.log(serializedResult);
      assertLighthouse(result);
    }
  }
}
