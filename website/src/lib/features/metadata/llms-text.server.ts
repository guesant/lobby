import type { SiteData } from '../content/content.types.ts';
import { siteOrigin } from '../navigation/origin.model.ts';
import { languageLinks } from './language-links.server.ts';

export function llmsText(data: SiteData): string {
  return [
    '# Lobby',
    '',
    `> Site pessoal de ${data.links.profile.name}, com páginas públicas sobre carreira, projetos, escrita, estudos e interesses.`,
    '',
    '## Recursos',
    '',
    `- [Catálogo público para IA](${siteOrigin}/ai-catalog.json)`,
    `- [Sitemap](${siteOrigin}/sitemap.xml)`,
    '',
    '## Páginas iniciais',
    '',
    ...languageLinks(data),
    '',
  ].join('\n');
}
