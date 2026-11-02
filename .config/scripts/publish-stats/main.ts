import { writeCiOutputs } from '../ci-policy.ts';
import { publishStatistics } from './publish-statistics.ts';

export async function main(): Promise<void> {
  const options: Parameters<typeof publishStatistics>[0] = {};

  if (process.env['GITHUB_STATS_TOKEN']) {
    options.token = process.env['GITHUB_STATS_TOKEN'];
  }

  if (process.env['GITHUB_REPOSITORY']) {
    options.repository = process.env['GITHUB_REPOSITORY'];
  }

  if (process.env['GITHUB_REF']) {
    options.ref = process.env['GITHUB_REF'];
  }

  const result = await publishStatistics(options);

  let summary =
    'Statistics unchanged; no commit, build or deployment requested.';

  if (result.changed) {
    summary = `Statistics committed at ${result.sha}; validation and build will use this SHA.`;
  }

  await writeCiOutputs(result, summary);
}
