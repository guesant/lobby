import type { FederationItem } from './content.types.ts';
import { requiredText } from './validation.model.ts';

export function federationType(
  value: unknown,
  label: string,
): FederationItem['type'] {
  switch (requiredText(value, label)) {
    case 'post':
      return 'post';

    case 'case':
      return 'case';

    case 'project':
      return 'project';

    case 'skill':
      return 'skill';

    case 'experience':
      return 'experience';

    case 'education':
      return 'education';

    default:
      throw new Error(`Invalid ${label}`);
  }
}
