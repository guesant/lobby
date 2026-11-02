export type Alternate = {
  id: string;
  href: string;
  hreflang: string;
  ogLocale: string;
};

export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogImageURL: string;
  robots: 'noindex, follow' | 'index, follow';
  alternates: Alternate[];
  ogAlternates: Alternate[];
  defaultLanguageURL: string;
  structuredData: string;
};

export type StructuredPageMetadata = Omit<PageMetadata, 'structuredData'>;
