import { record } from '../../website/src/lib/features/content/validation.model.ts';
import {
  extractedDependencies,
  hasManagedDependency,
} from './check-renovate.ts';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';
import { parse } from 'yaml';

test('Corepack extraction must retain both the release and its exact checksum', (): void => {
  const dependency = {
    file: '.config/container/Dockerfile',
    manager: 'regex',
    name: 'nodejs/corepack',
    version: 'v0.36.0',
    digest: '1'.repeat(64),
  };

  const extracted = extractedDependencies(
    JSON.stringify({
      msg: 'Extracted dependencies',
      packageFiles: {
        regex: [
          {
            packageFile: dependency.file,
            deps: [
              {
                depName: dependency.name,
                currentValue: dependency.version,
                currentDigest: dependency.digest,
              },
            ],
          },
        ],
      },
    }),
  );

  assert.equal(hasManagedDependency(extracted, dependency), true);
  assert.equal(
    hasManagedDependency(extracted, {
      ...dependency,
      digest: '2'.repeat(64),
    }),
    false,
  );
  assert.equal(
    hasManagedDependency(extracted, {
      ...dependency,
      version: 'v0.37.0',
    }),
    false,
  );
  assert.throws((): unknown => {
    return extractedDependencies('{}');
  }, /interpretable/);
});

test('CodeQL is manual, containerized, read-only and independent from publishing', async (): Promise<void> => {
  const workflow = record(
    parse(await readFile('.github/workflows/ci.yml', 'utf8')) as unknown,
    'workflow',
  );

  const jobs = record(workflow['jobs'], 'jobs');

  const job = record(jobs['codeql'], 'CodeQL');

  assert.equal(
    job['if'],
    "github.event_name == 'workflow_dispatch' && needs.plan.outputs.operation == 'audit'",
  );
  assert.equal(job['needs'], 'plan');
  assert.equal(job['timeout-minutes'], 25);
  assert.deepEqual(job['permissions'], {
    contents: 'read',
    'security-events': 'write',
  });
  assert.match(
    String(record(job['container'], 'container')['image']),
    /^node:24\..+@sha256:[a-f0-9]{64}$/,
  );
  assert.ok(Array.isArray(job['steps']));

  const steps = job['steps'].map((entry: unknown): Record<string, unknown> => {
    return record(entry, 'step');
  });

  const init = steps.find((step): boolean => {
    return String(step['uses'])
      .startsWith('github/codeql-action/init@');
  });

  assert.ok(init);
  assert.equal(record(init['with'], 'CodeQL configuration')['tools'], 'linked');
  assert.equal(
    record(init['with'], 'CodeQL configuration')['languages'],
    'javascript-typescript',
  );
  assert.equal(
    record(init['with'], 'CodeQL configuration')['queries'],
    'security-extended',
  );
  assert.ok(
    steps.some((step): boolean => {
      return String(step['uses'])
        .startsWith('github/codeql-action/analyze@');
    }),
  );
});
