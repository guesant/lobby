import type { SiteData } from '../content/content.types.ts';
import { absoluteURL } from './catalog-context.server.ts';
import { escapeMarkdownLabel } from './escape-markdown-label.server.ts';

export function languageLinks(data: SiteData): string[] {
  const output: string[] = [];

  for (const language of data.links.language_options) {
    const label = escapeMarkdownLabel(language.label);

    const url = absoluteURL(language.path);

    const link = `- [${label}](${url})`;

    output.push(link);
  }

  return output;
}
