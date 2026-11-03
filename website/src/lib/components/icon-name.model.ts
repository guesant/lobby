import manifest from '../../assets/icons/manifest.json' with { type: 'json' };
import type { IconName } from './icon-name.types.ts';

export function isIconName(value: string): value is IconName {
  return Object.hasOwn(manifest.icons, value);
}
