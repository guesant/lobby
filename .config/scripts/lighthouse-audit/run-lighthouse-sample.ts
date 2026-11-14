import type { LighthouseResult } from './lighthouse-audit.types.ts';
import { runLighthouse } from './run-lighthouse.ts';

export async function runLighthouseSample(
  url: string,
  output: string,
  run: number,
): Promise<LighthouseResult> {
  const result = await runLighthouse(url, output);

  console.log({
    run,
    ...result,
  });

  return result;
}
