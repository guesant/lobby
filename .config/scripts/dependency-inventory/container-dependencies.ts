import { corepackDependencies } from './corepack-dependencies.ts';
import { debianDependencies } from './debian-dependencies.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';
import { dockerfileImageDependencies } from './dockerfile-image-dependencies.ts';
import { readFile } from 'node:fs/promises';

export async function containerDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  const dockerfile = '.config/container/Dockerfile';

  const docker = await readFile(dockerfile, 'utf8');

  const images = dockerfileImageDependencies(docker, dockerfile);

  dependencies.push(...images);

  const debianPackages = debianDependencies(docker, dockerfile);

  dependencies.push(...debianPackages);

  const corepack = corepackDependencies(docker, dockerfile);

  dependencies.push(...corepack);

  return dependencies;
}
