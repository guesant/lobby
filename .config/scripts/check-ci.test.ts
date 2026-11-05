import { deploymentStatus, resolveRun } from './ci-policy.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const sha = '1'.repeat(40);

const newer = '2'.repeat(40);

test('publication operations reject other branches and malformed inputs', (): void => {
  for (const operation of [
    'publish',
    'statistics',
  ]) {
    assert.throws((): unknown => {
      return resolveRun({
        eventName: 'workflow_dispatch',
        operation,
        ref: 'refs/heads/feature',
        sha,
      });
    }, /main/);
  }

  assert.throws((): unknown => {
    return resolveRun({
      eventName: 'workflow_dispatch',
      operation: 'unknown',
      ref: 'refs/heads/main',
      sha,
    });
  }, /Unsupported/);
  assert.throws((): unknown => {
    return resolveRun({
      eventName: 'push',
      ref: 'refs/heads/main',
      sha: 'invalid',
    });
  }, /SHA/);
});

test('statistics updates create a candidate without publishing directly', (): void => {
  const result = resolveRun({
    eventName: 'schedule',
    ref: 'refs/heads/main',
    sha,
  });

  assert.equal(result.operation, 'statistics');
  assert.equal(result.update_statistics, true);
  assert.equal(result.publish, false);
});

test('deployment fails closed and skips an obsolete main snapshot', async (): Promise<void> => {
  const result = await deploymentStatus({
    sha,
    repository: 'guesant/lobby',
    token: 'test',
    fetcher: (): Promise<{
      ok: boolean;
      status: number;
      json(): Promise<unknown>;
    }> => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: (): Promise<unknown> => {
          return Promise.resolve({
            object: {
              sha: newer,
            },
          });
        },
      });
    },
  });

  assert.equal(result.current, false);
  assert.equal(result.source_sha, sha);
  await assert.rejects(
    deploymentStatus({
      sha,
      repository: 'guesant/lobby',
      token: 'test',
      fetcher: (): Promise<never> => {
        return Promise.reject(new Error('network failed'));
      },
    }),
    /network failed/,
  );
});
