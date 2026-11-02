import {
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { LighthouseConfiguration } from './lighthouse-configuration.types.ts';
import { readFileSync } from 'node:fs';

export function lighthouseConfiguration(): LighthouseConfiguration {
  const source = readFileSync('.config/lighthouserc.json', 'utf8');

  const parsed: unknown = JSON.parse(source);

  const root = record(parsed, 'Lighthouse configuration');

  const ci = record(root['ci'], 'Lighthouse CI configuration');

  const assertion = record(ci['assert'], 'Lighthouse assertions');

  const collect = record(ci['collect'], 'Lighthouse collection');

  const settings = record(collect['settings'], 'Lighthouse settings');

  return {
    ci: {
      assert: {
        assertions: record(assertion['assertions'], 'Lighthouse assertions'),
      },
      collect: {
        settings: {
          chromeFlags: requiredText(settings['chromeFlags'], 'Chrome flags'),
        },
      },
    },
  };
}
