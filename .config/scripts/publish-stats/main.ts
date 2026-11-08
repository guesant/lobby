import { writeCiOutputs } from '../ci-policy.ts';
import { publishStatistics } from './publish-statistics.ts';

export async function main(): Promise<void> {
  const options: Parameters<typeof publishStatistics>[0] = {};

  if (process.env['GITHUB_STATS_PUBLISH_TOKEN']) {
    options.token = process.env['GITHUB_STATS_PUBLISH_TOKEN'];
  }

  if (process.env['GITHUB_REPOSITORY']) {
    options.repository = process.env['GITHUB_REPOSITORY'];
  }

  if (process.env['GITHUB_REF']) {
    options.ref = process.env['GITHUB_REF'];
  }

  const result = await publishStatistics(options);

  let summary =
    'Statistics unchanged; no commit, pull request or build requested.';

  if (result.changed) {
    summary = `Statistics branch updated at ${result.sha}; the workflow will validate it before the pull request is merged.`;
  }

  await writeCiOutputs(result, summary);
}
