import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import type { Component } from 'svelte';
import { record } from '../../website/src/lib/validation-primitives.ts';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { websiteRoot } from './paths.ts';

const root = resolve(websiteRoot, '.svelte-kit');

await mkdir(root, {
  recursive: true,
});

const output = await mkdtemp(join(root, 'listing-fixtures-'));

const modules = new Map<string, string>();

async function compileComponent(path: string): Promise<string> {
  if (modules.has(path)) {
    return modules.get(path)!;
  }

  const target = join(output, `${modules.size}.mjs`);

  modules.set(path, target);

  let code = compile(await readFile(path, 'utf8'), {
    filename: path,
    generate: 'server',
  }).js.code;

  const imports = [
    ...code.matchAll(/from (['"])(\.[^'"]+)\1/g),
  ];

  for (const match of imports) {
    const dependency = resolve(dirname(path), match[2]!);

    let url = pathToFileURL(dependency).href;

    if (dependency.endsWith('.svelte')) {
      url = pathToFileURL(await compileComponent(dependency)).href;
    }

    let replacement = `from ${JSON.stringify(url)}`;

    if (dependency.endsWith('.json')) {
      replacement += ' with { type: "json" }';
    }

    code = code.replace(match[0], replacement);
  }

  await writeFile(target, code);

  return target;
}

export async function renderListingFixture(
  component: string,
  props: Record<string, unknown>,
): Promise<string> {
  const path = await compileComponent(
    resolve(websiteRoot, 'src/lib', component),
  );

  const imported: unknown = await import(pathToFileURL(path).href);

  const componentModule = record(imported, 'compiled component');

  if (typeof componentModule.default !== 'function') {
    throw new Error('Invalid compiled Svelte component');
  }

  return render(componentModule.default as Component<Record<string, unknown>>, {
    props,
  }).body;
}
