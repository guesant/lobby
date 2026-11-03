import { isIconName } from './icon-name.model.ts';
import type { IconName } from './icon-name.types.ts';

export function resolveIcon(value: string): IconName {
  if (isIconName(value)) {
    return value;
  }

  return 'link';
}
