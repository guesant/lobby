import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function writeCiOutputs(
  result: Record<string, string | boolean>,
  summary: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const output = env['CI_OUTPUT_PATH'];

  const summaryPath = env['CI_SUMMARY_PATH'];

  if (!output || !summaryPath) {
    throw new Error('Missing CI output or summary path');
  }

  for (const path of [
    output,
    summaryPath,
  ]) {
    const parentDirectory = dirname(path);

    await mkdir(parentDirectory, {
      recursive: true,
    });
  }

  let lines = '';

  for (const [
    key,
    value,
  ] of Object.entries(result)) {
    lines += `${key}=${String(value)}\n`;
  }

  await writeFile(output, lines);
  await writeFile(summaryPath, `${summary}\n`);
}
