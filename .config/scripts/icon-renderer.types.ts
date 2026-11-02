type IconTile = {
  png: string;
  column: number;
  row: number;
};

export type AtlasRequest = {
  tiles: IconTile[];
  columns: number;
  tileSize: number;
  compactTileSize: number;
};

export type AtlasContextSize = {
  columns: number;
  size: number;
  smoothing: boolean;
};
