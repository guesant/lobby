import type { LinkDocument } from './content.types.ts';
import { presentationFromUnknown } from './presentation.validation.ts';
import { seoFromUnknown } from './seo.validation.ts';
import { record, requiredText, validateTextMap } from './validation.model.ts';

export function localeFromUnknown(
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
