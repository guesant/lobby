import manifest from '../../assets/icons/manifest.json' with { type: 'json' };

export type IconName = keyof typeof manifest.icons;

export function isIconName(value: string): value is IconName {
  return Object.hasOwn(manifest.icons, value);
}
