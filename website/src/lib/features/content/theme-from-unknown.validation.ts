import type { LinkDocument } from './content.types.ts';
import { record, requiredBoolean, requiredText } from './validation.model.ts';

export function themeFromUnknown(value: unknown): LinkDocument['theme'] {
  const theme = record(value, 'links.theme');

  return {
    preset: requiredText(theme['preset'], 'links.theme.preset'),
    appearance: requiredText(theme['appearance'], 'links.theme.appearance'),
    background: requiredText(theme['background'], 'links.theme.background'),
    animations_enabled: requiredBoolean(
      theme['animations_enabled'],
      'links.theme.animations_enabled',
    ),
  };
}
