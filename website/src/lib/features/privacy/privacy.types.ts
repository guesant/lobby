export type PrivacyPolicyContent = {
  title: string;
  description: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
  contactLabel: string;
  contactURL: string;
  analyticsEnabled: boolean;
  inactiveNotice: string;
  referencesLabel: string;
  references: {
    label: string;
    url: string;
  }[];
};
