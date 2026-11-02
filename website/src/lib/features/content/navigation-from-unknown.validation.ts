import type { LinkDocument } from './content.types.ts';
import {
  record,
  requiredText,
  strings,
  validateTextMap,
} from './validation.model.ts';

export function navigationFromUnknown(
  value: unknown,
): LinkDocument['navigation'] {
  const navigation = record(value, 'links.navigation');

  const home = record(navigation['home'], 'links.navigation.home');

  return {
    sections: strings(navigation['sections'], 'links.navigation.sections'),
    links: strings(navigation['links'], 'links.navigation.links'),
    home: {
      icon: requiredText(home['icon'], 'links.navigation.home.icon'),
      labels: validateTextMap(home['labels'], 'links.navigation.home.labels'),
    },
    labels: validateTextMap(navigation['labels'], 'links.navigation.labels'),
  };
}
