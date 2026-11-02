import type {
  InterfaceController,
  InterfaceDependencies,
} from './interface-controller.types.ts';
import { selectInterface } from './select-interface.ts';

export type { InterfaceController } from './interface-controller.types.ts';

export function createInterfaceController(
  dependencies: InterfaceDependencies,
): InterfaceController {
  return {
    select: selectInterface.bind(null, dependencies),
  };
}
