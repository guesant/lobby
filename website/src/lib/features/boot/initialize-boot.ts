import type { BootController } from './boot-controller.types.ts';
import { completeBootNavigation } from '#lib/browser/complete-boot-navigation.ts';

export function initializeBoot(actions: BootController): void {
  void completeBootNavigation(actions.start);
}
