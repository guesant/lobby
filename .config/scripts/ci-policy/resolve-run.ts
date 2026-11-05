import type { RunPlan } from './ci-policy.types.ts';
import { validateSha } from './validate-sha.ts';

export function resolveRun(input: {
  eventName?: string;
  ref?: string;
  sha?: unknown;
  operation?: string;
}): RunPlan {
  const {
    eventName,
    ref,
    sha,
    operation = 'validate'
  } = input;

  const operations: Record<string, string> = {
    push: 'publish',
    pull_request: 'validate',
    schedule: 'statistics',
    workflow_dispatch: operation,
  };

  const selected = operations[eventName ?? ''];

  if (
    !selected ||
    ![
      'validate',
      'audit',
      'publish',
      'statistics',
    ].includes(selected)
  ) {
    throw new Error('Unsupported CI operation or event');
  }

  const publish = selected === 'publish';

  if ((publish || selected === 'statistics') && ref !== 'refs/heads/main') {
    throw new Error('Publication and statistics require the main branch');
  }

  return {
    operation: selected,
    update_statistics: selected === 'statistics',
    source_sha: validateSha(sha),
    publish,
  };
}
