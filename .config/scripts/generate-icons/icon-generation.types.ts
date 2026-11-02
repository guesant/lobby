export type AtlasTile = {
  png: string;
  column: number;
  row: number;
};

export type RenderContext = {
  tiles: AtlasTile[];
  names: string[];
  tileSize: number;
  compactTileSize: number;
  favicon: string;
};

export type ManifestContext = {
  catalog: Record<string, boolean>;
  names: string[];
  tileSize: number;
  compactTileSize: number;
  opticalScales: Record<string, number>;
};
