import { record } from '../../website/src/lib/features/content/validation.model.ts';
import {
  extractedDependencies,
  hasManagedDependency,
} from './check-renovate.ts';
import { workflowImageDependencies } from './dependency-inventory/workflow-image-dependencies.ts';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';
import { parse } from 'yaml';

test('Renovate runs on main with an isolated schedule, App token and manual dry-run default', async (): Promise<void> => {
  const file = '.github/workflows/renovate.yml';

  const source = await readFile(file, 'utf8');

  const workflow = record(parse(source) as unknown, 'Renovate workflow');

  const triggers = record(workflow['on'], 'Renovate triggers');

  assert.deepEqual(Object.keys(triggers), [
    'schedule',
    'workflow_dispatch',
  ]);
  assert.deepEqual(triggers['schedule'], [
    {
      cron: '0 6 * * *',
    },
  ]);

  const dispatch = record(triggers['workflow_dispatch'], 'manual operation');

  const inputs = record(dispatch['inputs'], 'manual inputs');

  const mode = record(inputs['mode'], 'manual mode');

  assert.equal(mode['default'], 'dry-run');
  assert.deepEqual(mode['options'], [
    'dry-run',
    'run',
  ]);
  assert.deepEqual(workflow['permissions'], {
    contents: 'read',
  });
  assert.deepEqual(workflow['concurrency'], {
    group: 'renovate-lobby',
    'cancel-in-progress': false,
  });

  const job = record(
    record(workflow['jobs'], 'jobs')['renovate'],
    'Renovate job',
  );

  assert.equal(job['if'], "github.ref == 'refs/heads/main'");
  assert.equal(job['timeout-minutes'], 30);
  assert.ok(Array.isArray(job['steps']));

  const steps = job['steps'].map((entry: unknown): Record<string, unknown> => {
    return record(entry, 'Renovate step');
  });

  const tokenStep = steps.find((step): boolean => {
    return step['id'] === 'app-token';
  });

  assert.ok(tokenStep);

  const token = record(tokenStep['with'], 'App token settings');

  assert.equal(token['owner'], 'guesant');
  assert.equal(token['repositories'], 'lobby');
  assert.equal(token['client-id'], '${{ vars.RENOVATE_APP_CLIENT_ID }}');
  assert.equal(token['private-key'], '${{ secrets.RENOVATE_APP_PRIVATE_KEY }}');
  assert.equal(token['permission-workflows'], 'write');
  assert.equal(token['skip-token-revoke'], undefined);

  const executor = steps.find((step): boolean => {
    return String(step['uses'])
      .startsWith('renovatebot/github-action@');
  });

  assert.ok(executor);

  const settings = record(executor['with'], 'Renovate executor');

  const environment = record(executor['env'], 'Renovate environment');

  assert.equal(settings['token'], '${{ steps.app-token.outputs.token }}');
  assert.equal(settings['configurationFile'], undefined);
  assert.equal(settings['mount-docker-socket'], false);
  assert.equal(environment['RENOVATE_REPOSITORIES'], 'guesant/lobby');
  assert.equal(environment['RENOVATE_REQUIRE_CONFIG'], 'required');
  assert.equal(environment['RENOVATE_ALLOW_SCRIPTS'], 'false');

  const images = workflowImageDependencies(file, source);

  const image = images[0];

  assert.equal(images.length, 1);
  assert.ok(image);
  assert.equal(image.name, 'ghcr.io/renovatebot/renovate');
  assert.match(image.digest ?? '', /^sha256:[a-f0-9]{64}$/);
  assert.ok(
    steps.some((step): boolean => {
      return String(step['run'])
        .includes('RENOVATE_DRY_RUN=full');
    }),
  );
});

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
