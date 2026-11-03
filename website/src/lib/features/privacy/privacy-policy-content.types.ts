import type { PrivacyPolicyContent } from './privacy.types.ts';

export type PrivacyPolicyContentCopy = Omit<
  PrivacyPolicyContent,
  'contactURL' | 'analyticsEnabled' | 'references'
>;
