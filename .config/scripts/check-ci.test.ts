import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveRun, deploymentStatus } from './ci-policy.ts';

const sha = '1'.repeat(40);

const newer = '2'.repeat(40);

void test('publication operations reject other branches and malformed inputs', (): void => {
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

void test('deployment fails closed and skips an obsolete main snapshot', async (): Promise<void> => {
  const result = await deploymentStatus({
    sha,
    repository: 'guesant/lobby',
    token: 'test',
    fetcher: async (): Promise<{
      ok: boolean;
      status: number;
      json(): Promise<unknown>;
    }> => {
      return {
        ok: true,
        status: 200,
        json: async (): Promise<unknown> => {
          return {
            object: {
              sha: newer,
            },
          };
        },
      };
    },
  });

  assert.equal(result.current, false);
  assert.equal(result.source_sha, sha);
  await assert.rejects(
    deploymentStatus({
      sha,
      repository: 'guesant/lobby',
      token: 'test',
      fetcher: async (): Promise<never> => {
        throw new Error('network failed');
      },
    }),
    /network failed/,
  );
});
