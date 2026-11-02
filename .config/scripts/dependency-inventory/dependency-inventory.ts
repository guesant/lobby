import { actionDependencies } from './action-dependencies.ts';
import { containerDependencies } from './container-dependencies.ts';
import type { ManagedDependency } from './dependency-inventory.types.ts';
import { packageDependencies } from './package-dependencies.ts';
import { pythonDependencies } from './python-dependencies.ts';

export async function dependencyInventory(): Promise<ManagedDependency[]> {
  const packageResult = packageDependencies();

  const containerResult = containerDependencies();

  const pythonResult = pythonDependencies();

  const actionResult = actionDependencies();

  const results = await Promise.all([
    packageResult,
    containerResult,
    pythonResult,
    actionResult,
  ]);

  return results.flat();
}
