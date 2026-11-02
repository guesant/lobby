import type { LinkDocument } from './content.types.ts';
import {
  array,
  record,
  requiredText,
  strings,
  validateTextMap,
} from './validation.model.ts';

function seoFromUnknown(
  value: unknown,
  label: string,
): LinkDocument['locales'][string]['seo'] {
  const seo = record(value, label);

  return {
    title: requiredText(seo['title'], `${label}.title`),
    description: requiredText(seo['description'], `${label}.description`),
  };
}

function presentationFromUnknown(
  value: unknown,
  label: string,
): LinkDocument['locales'][string]['presentation'] {
  const presentation = record(value, label);

  const facts = array(presentation['facts'], `${label}.facts`)
    .map(
      (
        fact,
        index,
      ): LinkDocument['locales'][string]['presentation']['facts'][number] => {
        const key = `${label}.facts[${String(index)}]`;

        const item = record(fact, key);

        return {
          icon: requiredText(item['icon'], `${key}.icon`),
          text: requiredText(item['text'], `${key}.text`),
        };
      },
    );

  return {
    title: requiredText(presentation['title'], `${label}.title`),
    facts,
    site_title: requiredText(presentation['site_title'], `${label}.site_title`),
    topics: strings(presentation['topics'], `${label}.topics`),
  };
}

function localeFromUnknown(
  value: unknown,
  label: string,
): LinkDocument['locales'][string] {
  const locale = record(value, label);

  const profile = record(locale['profile'], `${label}.profile`);

  const ui = validateTextMap(locale['ui'], `${label}.ui`);

  return {
    seo: seoFromUnknown(locale['seo'], `${label}.seo`),
    profile: {
      bio: requiredText(profile['bio'], `${label}.profile.bio`),
    },
    ui: {
      ...ui,
      third_party: requiredText(ui['third_party'], `${label}.ui.third_party`),
      html_lang: requiredText(ui['html_lang'], `${label}.ui.html_lang`),
    },
    presentation: presentationFromUnknown(
      locale['presentation'],
      `${label}.presentation`,
    ),
  };
}

export function localesFromUnknown(
  value: unknown,
  languages: Set<string>,
): LinkDocument['locales'] {
  const raw = record(value, 'links.locales');

  const locales: LinkDocument['locales'] = {};

  for (const language of languages) {
    locales[language] = localeFromUnknown(
      raw[language],
      `links.locales.${language}`,
    );
  }

  return locales;
}

function personalUpdate(
  value: unknown,
  label: string,
): LinkDocument['now'][string] {
  const source = record(value, label);

  const sections = array(source['sections'], `${label}.sections`)
    .map(
      (raw, index): LinkDocument['now'][string]['sections'][number] => {
        const key = `${label}.sections[${String(index)}]`;

        const item = record(raw, key);

        return {
          id: requiredText(item['id'], `${key}.id`),
          title: requiredText(item['title'], `${key}.title`),
          description: requiredText(item['description'], `${key}.description`),
        };
      },
    );

  return {
    seo: seoFromUnknown(source['seo'], `${label}.seo`),
    title: requiredText(source['title'], `${label}.title`),
    intro: requiredText(source['intro'], `${label}.intro`),
    sections,
  };
}

export function personalUpdates(value: unknown): LinkDocument['now'] {
  const raw = record(value, 'links.now');

  const now: LinkDocument['now'] = {};

  for (const [
    language,
    content,
  ] of Object.entries(raw)) {
    now[language] = personalUpdate(content, `links.now.${language}`);
  }

  return now;
}

export function languageOptions(
  value: unknown,
): LinkDocument['language_options'] {
  return array(value, 'links.language_options')
    .map(
      (item, index): LinkDocument['language_options'][number] => {
        const label = `links.language_options[${String(index)}]`;

        const language = record(item, label);

        return {
          id: requiredText(language['id'], `${label}.id`),
          path: requiredText(language['path'], `${label}.path`),
          label: requiredText(language['label'], `${label}.label`),
          hreflang: requiredText(language['hreflang'], `${label}.hreflang`),
        };
      },
    );
}
