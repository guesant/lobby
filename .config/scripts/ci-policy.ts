import { runCli } from './ci-policy/run-cli.ts';

export { deploymentStatus } from './ci-policy/deployment-status.ts';
export { resolveRun } from './ci-policy/resolve-run.ts';
export { validateRepository } from './ci-policy/validate-repository.ts';
export { validateSha } from './ci-policy/validate-sha.ts';
export { writeCiOutputs } from './ci-policy/write-ci-outputs.ts';

if (import.meta.main) {
  await runCli();
}
