import {
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { Snapshot } from '@github/dependency-submission-toolkit';

export async function submitDependencySnapshot(
  snapshot: Snapshot,
  owner: string,
  repository: string,
): Promise<void> {
  const token = process.env['GITHUB_TOKEN'];

  if (token === undefined) {
    throw new Error('GITHUB_TOKEN is required for dependency submission');
  }

  const url = `https://api.github.com/repos/${owner}/${repository}/dependency-graph/snapshots`;

  const body = JSON.stringify(snapshot);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body,
  });

  const responseData: unknown = await response.json();

  const result = record(responseData, 'Dependency submission response');

  const submissionResult = String(result['result']);

  if (
    !response.ok ||
    ![
      'ACCEPTED',
      'SUCCESS',
    ].includes(submissionResult)
  ) {
    const message = requiredText(
      result['message'] ?? 'Unknown submission error',
      'Submission message',
    );

    const status = String(response.status);

    throw new Error(
      `Dependency snapshot submission failed (${status}): ${message}`,
    );
  }
}
