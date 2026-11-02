import type { LinkDocument } from './content.types.ts';
import { presentationFact } from './presentation-fact.validation.ts';
import { array, record, requiredText, strings } from './validation.model.ts';

export function presentationFromUnknown(
  value: unknown,
  label: string,
): LinkDocument['locales'][string]['presentation'] {
  const presentation = record(value, label);

  const facts: LinkDocument['locales'][string]['presentation']['facts'] = [];

  let index = 0;

  for (const fact of array(presentation['facts'], `${label}.facts`)) {
    const factLabel = `${label}.facts[${String(index)}]`;

    const validatedFact = presentationFact(fact, factLabel);

    facts.push(validatedFact);
    index += 1;
  }

  return {
    title: requiredText(presentation['title'], `${label}.title`),
    facts,
    site_title: requiredText(presentation['site_title'], `${label}.site_title`),
    topics: strings(presentation['topics'], `${label}.topics`),
  };
}
