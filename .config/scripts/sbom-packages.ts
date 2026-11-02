import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/features/content/validation.model.ts';

export function sbomPackages(value: unknown): Set<string> {
  const document = record(value, 'CycloneDX document');

  if (document['bomFormat'] !== 'CycloneDX') {
    throw new Error('Expected native CycloneDX SBOM');
  }

  const packages = new Set<string>();

  for (const raw of array(document['components'], 'SBOM components')) {
    const component = record(raw, 'SBOM component');

    const purl = requiredText(component['purl'], 'SBOM package URL');

    const match = /^pkg:npm\/(.+)@([^@?#]+)$/.exec(purl);

    if (!match?.[1]) {
      throw new Error(`Invalid npm package URL: ${purl}`);
    }

    const packageName = decodeURIComponent(match[1]);

    packages.add(packageName);
  }

  return packages;
}
