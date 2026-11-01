import { readFile, readdir } from 'node:fs/promises';
import { parse } from 'yaml';
import {
  record,
  requiredText,
} from '../../website/src/lib/validation-primitives.ts';

export type ManagedDependency = {
  file: string;
  manager: string;
  name: string;
  version: string;
};

async function workspaceDependencies(
  file: string,
): Promise<ManagedDependency[]> {
  const path = file.replace('package.json', 'pnpm-workspace.yaml');

  const workspace = record(
    parse(await readFile(path, 'utf8')) as unknown,
    'pnpm workspace',
  );

  return Object.entries(
    record(workspace.overrides || {}, 'pnpm overrides'),
  )
    .map(
      ([
        name,
        version,
      ]): ManagedDependency => {
        return {
          file: path,
          manager: 'npm',
          name,
          version: requiredText(version, `override ${name}`),
        };
      },
    );
}

async function packageDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  for (const file of [
    'website/package.json',
    '.config/package.json',
    '.config/audit/package.json',
  ]) {
    dependencies.push(...(await workspaceDependencies(file)));

    const value: unknown = JSON.parse(await readFile(file, 'utf8'));

    const manifest = record(value, file);

    for (const section of [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
    ]) {
      for (const [
        name,
        value,
      ] of Object.entries(
          record(manifest[section] || {}, `${file} ${section}`),
        )) {
        dependencies.push({
          file,
          manager: 'npm',
          name,
          version: requiredText(value, `version ${name}`),
        });
      }
    }

    dependencies.push({
      file,
      manager: 'npm',
      name: 'pnpm',
      version: requiredText(manifest.packageManager, `${file} package manager`),
    });
  }

  return dependencies;
}

async function containerDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  const dockerfile = '.config/container/Dockerfile';

  const docker = await readFile(dockerfile, 'utf8');

  for (const match of docker.matchAll(/^FROM\s+(\S+)/gm)) {
    const image = requiredText(match[1], 'Docker image');

    if (!image.includes(':')) {
      continue;
    }

    const parts = image.match(/^(.+):([^@]+)@(sha256:[a-f0-9]{64})$/);

    if (!parts) {
      throw new Error(`Unpinned Docker image: ${image}`);
    }

    dependencies.push({
      file: dockerfile,
      manager: 'dockerfile',
      name: requiredText(parts[1], 'image name'),
      version: requiredText(parts[2], 'image version'),
    });
  }

  for (const install of docker.matchAll(/apt-get install\s+([^&]+)/g)) {
    for (const match of (install[1] || '').matchAll(
      /(?:^|\s)([a-z][a-z0-9+.-]*)=([^\s\\]+)/g,
    )) {
      dependencies.push({
        file: dockerfile,
        manager: 'dockerfile',
        name: requiredText(match[1], 'Debian package'),
        version: requiredText(match[2], 'Debian version'),
      });
    }
  }

  for (const match of docker.matchAll(/corepack@([\d.]+)/g)) {
    dependencies.push({
      file: dockerfile,
      manager: 'regex',
      name: 'corepack',
      version: requiredText(match[1], 'Corepack version'),
    });
  }

  return dependencies;
}

async function pythonDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  const python = '.config/python/pyproject.toml';

  for (const match of (await readFile(python, 'utf8')).matchAll(
    /"([a-z][\w-]*)==([^"\s]+)"/g,
  )) {
    dependencies.push({
      file: python,
      manager: 'pep621',
      name: requiredText(match[1], 'Python package'),
      version: requiredText(match[2], 'Python version'),
    });
  }

  return dependencies;
}

async function actionDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  const workflows = await workflowFiles('.github');

  for (const file of workflows) {
    const source = await readFile(file, 'utf8');

    parse(source);

    for (const match of source.matchAll(/\buses:\s+([^\s@]+)@([^\s]+)/g)) {
      const version = requiredText(match[2], 'action revision');

      if (!/^[a-f0-9]{40}$/.test(version)) {
        throw new Error(`Unpinned action: ${file}: ${match[1]}`);
      }

      dependencies.push({
        file,
        manager: 'github-actions',
        name: requiredText(match[1], 'action name')
          .split('/')
          .slice(0, 2)
          .join('/'),
        version,
      });
    }

    for (const match of source.matchAll(
      /\b(node):([\d.]+-bookworm-slim)@(sha256:[a-f0-9]{64})/g,
    )) {
      dependencies.push({
        file,
        manager: 'regex',
        name: 'node',
        version: requiredText(match[2], 'inline image version'),
      });
    }
  }

  return dependencies;
}

export async function dependencyInventory(): Promise<ManagedDependency[]> {
  return (
    await Promise.all([
      packageDependencies(),
      containerDependencies(),
      pythonDependencies(),
      actionDependencies(),
    ])
  ).flat();
}

async function workflowFiles(directory: string): Promise<string[]> {
  const files: string[] = [];

  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    const path = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...(await workflowFiles(path)));
    } else if (/\.ya?ml$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

if (import.meta.main) {
  console.log(JSON.stringify(await dependencyInventory(), null, 2));
}
