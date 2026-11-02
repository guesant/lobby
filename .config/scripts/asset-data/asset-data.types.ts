export type IconManifest = {
  count: number;
  tileSize: number;
  compactTileSize: number;
  icons: Record<
    string,
    {
      colored: boolean;
      position: number;
      opticalScale: number;
    }
  >;
};

export type IconGeometry = {
  tile_size: number;
  compact_tile_size: number;
  interface_grid: number;
  display_sizes: number[];
  icons: Record<string, unknown>;
};

export type CursorCatalog = {
  browser_size: number;
  padding: number;
  assets: {
    id: string;
    source: string;
    file: string;
    hotspot: [
      number,
      number,
    ];
  }[];
};

export type RailGeometry = {
  width: number;
  slices: Record<
    string,
    {
      top: number;
      height: number;
    }
  >;
};
