import { deploymentStatus } from './deployment-status.ts';
import { deploymentSummary } from './deployment-summary.ts';
import { writeCiOutputs } from './write-ci-outputs.ts';

export async function runDeploymentCommand(): Promise<void> {
  const input: Parameters<typeof deploymentStatus>[0] = {};

  if (process.env['CI_SOURCE_SHA']) {
    input.sha = process.env['CI_SOURCE_SHA'];
  }

  if (process.env['GITHUB_REPOSITORY']) {
    input.repository = process.env['GITHUB_REPOSITORY'];
  }

  if (process.env['GITHUB_TOKEN']) {
    input.token = process.env['GITHUB_TOKEN'];
  }

  const result = await deploymentStatus(input);

  const summary = deploymentSummary(
    result.current,
    result.source_sha,
    result.main_sha,
  );

  await writeCiOutputs(result, summary);
}
