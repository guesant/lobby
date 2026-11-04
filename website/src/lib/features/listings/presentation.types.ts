import type { LinkDocument, LinkRecord } from '../content/content.types.ts';

export type DestinationContext = {
  config: Pick<LinkDocument, 'site'>;
  locale: string;
  interfaceName: 'voxel' | 'terminal';
  origin?: string;
};

export type PresentationDestination = {
  href: string;
  external: boolean;
  thirdParty: boolean;
  target: string;
  rel?: string;
  display: string;
};

export type DestinationInput = Pick<LinkRecord, 'url' | 'target'>;
