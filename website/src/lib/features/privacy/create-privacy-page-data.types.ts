import type { PageLoadData } from '../content/content.types.ts';
import type { PrivacyPolicyContent } from './privacy.types.ts';

export type PrivacyPageDataInput = {
  base: PageLoadData;
  locale: string;
  interfaceName: 'voxel' | 'terminal';
  privacyPolicy: PrivacyPolicyContent;
};
