import type { IconManifest } from '../asset-data.ts';
import type { ManifestContext } from './icon-generation.types.ts';

export function createManifest(context: ManifestContext): IconManifest {
  const icons: IconManifest['icons'] = {};

  for (const [
    column,
    name,
  ] of context.names.entries()) {
    const colored = context.catalog[name];

    const opticalScale = context.opticalScales[name];

    if (colored === undefined || opticalScale === undefined) {
      throw new Error(`Missing icon metadata: ${name}`);
    }

    icons[name] = {
      colored,
      position: (column / (context.names.length - 1)) * 100,
      opticalScale,
    };
  }

  return {
    count: context.names.length,
    tileSize: context.tileSize,
    compactTileSize: context.compactTileSize,
    icons,
  };
}
