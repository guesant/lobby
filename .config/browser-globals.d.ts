import type {
  CategoryPreviews,
  PreviewRecord,
} from './scripts/layout-helpers.types.ts';
import type { RasterPixels } from './scripts/raster-pixels.types.ts';

declare global {
  interface Window {
    lobbyAssertions: {
      element(parent: ParentNode, selector: string): HTMLElement;
    };
    rasterPixels(png: string): Promise<RasterPixels>;
    lobbyLayout: {
      rowAligned(elements: Element[]): boolean;
      galleryColumns(): number;
      previewLinks(elements: Element[]): PreviewRecord[];
      categories(elements: Element[]): CategoryPreviews[];
    };
    __languageFrame: HTMLElement | null;
    __languageSettings: HTMLElement | null;
    __sceneRestarts: number;
    __languageDocument: Document;
    __languageHistory: number;
    __languageFallbackDocument: Document;
    componentParityNavigation: boolean;
    listingClicks: string[];
    linkClicks: string[];
    initialViewLinks: HTMLElement[];
    viewLongText: [
      HTMLElement,
      string,
    ][];
    navigationTest: boolean;
  }
}
