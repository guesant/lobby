import { completeBootNavigation } from './complete-boot-navigation.ts';
import type { AfterNavigate } from '$app/navigation';

export function handleBootNavigation(
  start: () => void,
  navigation: AfterNavigate,
): void {
  const complete = completeBootNavigation.bind(null, start);

  void navigation.complete.then(complete);
}
