import { handleBootNavigation } from './handle-boot-navigation.ts';
import { afterNavigate } from '$app/navigation';

export function registerBootNavigation(start: () => void): void {
  const handleNavigation = handleBootNavigation.bind(null, start);

  afterNavigate(handleNavigation);
}
