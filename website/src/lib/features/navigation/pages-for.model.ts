import type { LinkDocument } from '../content/content.types.ts';
import { linkedPages } from './linked-pages.model.ts';
import type { ConfiguredPage } from './routes.types.ts';
import { sectionPages } from './section-pages.model.ts';

export function pagesFor(
  configuration: LinkDocument,
  language: string,
): ConfiguredPage[] {
  let option: LinkDocument['language_options'][number] | undefined;

  for (const entry of configuration.language_options) {
    if (entry.id === language) {
      option = entry;
      break;
    }
  }

  const title = configuration.navigation.home.labels[language];

  if (!option || !title) {
    throw new Error(`Unknown navigation language: ${language}`);
  }

  return [
    {
      id: 'home',
      type: 'home',
      title,
      url: option.path,
      icon: configuration.navigation.home.icon,
    },
    ...sectionPages(configuration, language, option.path),
    ...linkedPages(configuration, language),
  ];
}
