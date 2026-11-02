import type { LinkDocument } from './content.types.ts';
import { record, requiredText, strings } from './validation.model.ts';

export function siteFromUnknown(value: unknown): LinkDocument['site'] {
  const site = record(value, 'links.site');

  return {
    repository: requiredText(site['repository'], 'links.site.repository'),
    repository_label: requiredText(
      site['repository_label'],
      'links.site.repository_label',
    ),
    first_party_domains: strings(
      site['first_party_domains'],
      'links.site.first_party_domains',
    ),
  };
}
