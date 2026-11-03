import type { PrivacyPolicyContent } from './privacy.types.ts';

export const privacyPolicyCopyEn: Omit<
  PrivacyPolicyContent,
  'contactURL' | 'analyticsEnabled' | 'references'
> = {
  title: 'Privacy Policy',
  description: 'How this site handles browsing data and consent choices.',
  contactLabel: 'Contact by email',
  inactiveNotice: 'Google Analytics is not active on this site build yet.',
  referencesLabel: 'Sources and related information',
  sections: [
    {
      title: 'Controller',
      paragraphs: [
        'Gabriel R. Antunes is responsible for the processing of personal data carried out by this site. Privacy questions and requests can be sent using the contact link at the end of this page.',
      ],
    },
    {
      title: 'Analytics and measured data',
      paragraphs: [
        'Google Analytics is loaded only if you accept. When enabled, it may measure page views, scrolling, outbound link clicks, downloads, embedded video engagement and form interactions. Search terms are not sent. Google Signals and advertising personalization are disabled in the site configuration.',
        'These features may process visited page addresses, visit sources, browser and device technical information, and data associated with measured interactions. Do not place personal information in URLs or content intended for measurement.',
      ],
    },
    {
      title: 'Purpose and choice',
      paragraphs: [
        'The purpose is to understand site usage and guide improvements. Measurement depends on your choice: before acceptance, the Google tag is not loaded and no Analytics data is sent. You may reject or withdraw consent in Settings.',
      ],
    },
    {
      title: 'Google and transfers',
      paragraphs: [
        'When you accept, data is sent to Google Analytics, a service provided by Google. Google may process it on infrastructure in other countries under its terms and policies. You may also consult Google’s privacy policy and information about technologies used on partner sites.',
      ],
    },
    {
      title: 'Retention',
      paragraphs: [
        'The intended retention setting for Analytics event and user data is two months. Standard aggregated reports may follow separate Google Analytics controls and retention. Your consent choice is stored in this browser for six months and can be changed sooner.',
      ],
    },
    {
      title: 'Your rights and contact',
      paragraphs: [
        'You may request information about processing, exercise applicable data protection rights, or withdraw consent. Requests are handled under applicable law and based on available data. Withdrawal stops new measurements by this site but does not automatically erase data already received by Google; where applicable, deletion must also be requested from the provider.',
      ],
    },
  ],
};
