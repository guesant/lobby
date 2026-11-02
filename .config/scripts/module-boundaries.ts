import { checkModules } from './module-boundaries/check-modules.ts';

export { moduleCycles } from './module-boundaries/module-cycles.ts';

if (import.meta.main) {
  await checkModules();
}
