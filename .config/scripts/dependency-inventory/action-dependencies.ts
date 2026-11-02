import type { ManagedDependency } from './dependency-inventory.types.ts';
import { workflowActionDependencies } from './workflow-action-dependencies.ts';
import { workflowFiles } from './workflow-files.ts';
import { workflowImageDependencies } from './workflow-image-dependencies.ts';
import { readFile } from 'node:fs/promises';

export async function actionDependencies(): Promise<ManagedDependency[]> {
  const dependencies: ManagedDependency[] = [];

  const workflows = await workflowFiles('.github');

  for (const file of workflows) {
    const source = await readFile(file, 'utf8');

    const actions = workflowActionDependencies(file, source);

    const images = workflowImageDependencies(file, source);

    dependencies.push(...actions, ...images);
  }

  return dependencies;
}
