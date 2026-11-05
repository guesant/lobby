import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';
import type { CycloneDXComponent } from './dependency-snapshot.types.ts';

export function readCycloneDXComponents(value: unknown): CycloneDXComponent[] {
  const rawComponents = array(value, 'CycloneDX components');

  const components: CycloneDXComponent[] = [];

  for (const rawComponent of rawComponents) {
    const component = record(rawComponent, 'CycloneDX component');

    const bomRef = requiredText(
      component['bom-ref'],
      'CycloneDX component reference',
    );

    const purl = requiredText(
      component['purl'],
      'CycloneDX component package URL',
    );

    components.push({
      bomRef,
      purl,
    });
  }

  return components;
}
