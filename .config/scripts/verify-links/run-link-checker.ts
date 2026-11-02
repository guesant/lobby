import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function runLinkChecker(
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
