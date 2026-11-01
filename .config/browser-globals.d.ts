export {};

declare global {
  interface Window {
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
    viewLongText: Array<
      [
        HTMLElement,
        string,
      ]
    >;
    navigationTest: boolean;
  }
}
