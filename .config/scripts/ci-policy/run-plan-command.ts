import { textOr } from '../../../website/src/lib/features/content/text-or.model.ts';
import { resolveRun } from './resolve-run.ts';
import { writeCiOutputs } from './write-ci-outputs.ts';

export async function runPlanCommand(): Promise<void> {
  const input: Parameters<typeof resolveRun>[0] = {
    operation: textOr(process.env['CI_OPERATION'], 'validate'),
  };

  if (process.env['GITHUB_EVENT_NAME']) {
    input.eventName = process.env['GITHUB_EVENT_NAME'];
  }

  if (process.env['GITHUB_REF']) {
    input.ref = process.env['GITHUB_REF'];
  }

  if (process.env['GITHUB_SHA']) {
    input.sha = process.env['GITHUB_SHA'];
  }

  const result = resolveRun(input);

  const summary = `Operation: ${result.operation}. Source: ${result.source_sha}.`;

  await writeCiOutputs(result, summary);
}
