import { modulesIn } from '../module-dependencies.ts';
import { resolve } from 'node:path';

export async function moduleFiles(): Promise<string[]> {
  const roots = [
    resolve('website/src'),
    resolve('.config/scripts'),
    resolve('.config/eslint-rules'),
  ];

  const files: string[] = [];

  for (const root of roots) {
    const modules = await modulesIn(root);

    files.push(...modules);
  }

  return files;
}
