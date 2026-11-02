import type { BootController } from './boot-controller.types.ts';

export function cancelBoot(controller: BootController, event: Event): void {
  event.preventDefault();
  controller.finish();
}
