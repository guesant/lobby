import { dependencyInventory } from './dependency-inventory/dependency-inventory.ts';

export { dependencyInventory } from './dependency-inventory/dependency-inventory.ts';
export type { ManagedDependency } from './dependency-inventory/dependency-inventory.types.ts';

if (import.meta.main) {
  const inventory = await dependencyInventory();

  const serializedInventory = JSON.stringify(inventory, null, 2);

  console.log(serializedInventory);
}
