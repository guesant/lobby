import assert from 'node:assert/strict';
import test from 'node:test';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { getSiteData } from '../../website/src/lib/site-data.server.ts';
import { record } from '../../website/src/lib/validation-primitives.ts';
import { websiteRoot } from './paths.ts';

void test('editorial cache is isolated by root and invalidates after a source change', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'lobby-content-'));

  try {
    for (const name of [
      'first',
      'second',
    ]) {
      const root = join(directory, name);

      await mkdir(join(root, 'src'), {
        recursive: true,
      });
      await cp(join(websiteRoot, 'src/data'), join(root, 'src/data'), {
        recursive: true,
      });
    }

    const first = join(directory, 'first');

    const second = join(directory, 'second');

    const path = join(second, 'src/data/links.yaml');

    const document = record(
      parse(await readFile(path, 'utf8')) as unknown,
      'links',
    );

    const profile = record(document.profile, 'profile');

    profile.name = 'Cache Isolation Fixture';
    await writeFile(path, stringify(document));

    const original = await getSiteData(first);

    assert.equal(
      (await getSiteData(second)).links.profile.name,
      'Cache Isolation Fixture',
    );
    assert.notEqual(original.links.profile.name, 'Cache Isolation Fixture');
    profile.name = 'Updated Cache Fixture';
    await writeFile(path, stringify(document));
    assert.equal(
      (await getSiteData(second)).links.profile.name,
      'Updated Cache Fixture',
    );
    await writeFile(path, 'invalid: document\n');
    await assert.rejects(getSiteData(second));
    await writeFile(path, stringify(document));
    assert.equal(
      (await getSiteData(second)).links.profile.name,
      'Updated Cache Fixture',
    );
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }
});
