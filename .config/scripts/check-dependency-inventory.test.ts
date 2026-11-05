import {
  extractedDependencies,
  hasManagedDependency,
} from './check-renovate.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';

test('extraction preserves the Corepack release and checksum and rejects unreadable output', (): void => {
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
