import type { IconName } from './icon-name.model.ts';
import { isIconName } from './icon-name.model.ts';

export function resolveIcon(value: string): IconName {
  if (isIconName(value)) {
    return value;
  }

  return 'link';
}
