import type { LinkRecord } from './content.types.ts';
import { linkStats } from './link-stats.validation.ts';
import { linkVisual } from './link-visual.validation.ts';
import { optionalProperty } from './object-fields.model.ts';
import { optionalStrings } from './optional-strings.validation.ts';
import type { UnknownRecord } from './validation.model.ts';
import { optionalString } from './validation.model.ts';

export function optionalLinkFields(
  source: UnknownRecord,
  label: string,
): Pick<
  LinkRecord,
  | 'title'
  | 'description'
  | 'badge'
  | 'target'
  | 'audiences'
  | 'stats'
  | 'visual'
> {
  const title = optionalString(source['title'], `${label}.title`);

  const description = optionalString(
    source['description'],
    `${label}.description`,
  );

  const badge = optionalString(source['badge'], `${label}.badge`);

  const target = optionalString(source['target'], `${label}.target`);

  const audiences = optionalStrings(source['audiences'], `${label}.audiences`);

  const stats = linkStats(source['stats'], `${label}.stats`);

  const visual = linkVisual(source['visual'], `${label}.visual`);

  const titleProperty = optionalProperty('title', title);

  const descriptionProperty = optionalProperty('description', description);

  const badgeProperty = optionalProperty('badge', badge);

  const targetProperty = optionalProperty('target', target);

  const audiencesProperty = optionalProperty('audiences', audiences);

  const statsProperty = optionalProperty('stats', stats);

  const visualProperty = optionalProperty('visual', visual);

  return {
    ...titleProperty,
    ...descriptionProperty,
    ...badgeProperty,
    ...targetProperty,
    ...audiencesProperty,
    ...statsProperty,
    ...visualProperty,
  };
}
