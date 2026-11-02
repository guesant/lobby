import type { LinkDocument } from './content.types.ts';
import { languageOption } from './language-option.validation.ts';
import { array } from './validation.model.ts';

export function languageOptions(
  value: unknown,
): LinkDocument['language_options'] {
  const output: LinkDocument['language_options'] = [];

  let index = 0;

  for (const item of array(value, 'links.language_options')) {
    const itemLabel = `links.language_options[${String(index)}]`;

    const option = languageOption(item, itemLabel);

    output.push(option);
    index += 1;
  }

  return output;
}
