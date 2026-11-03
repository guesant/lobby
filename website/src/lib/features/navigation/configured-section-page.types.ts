import type { LinkDocument } from '../content/content.types.ts';

export type SectionPageContext = {
  configuration: LinkDocument;
  language: string;
  path: string;
  id: string;
};
