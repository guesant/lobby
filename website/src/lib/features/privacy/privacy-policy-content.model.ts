import type { PrivacyPolicyContent } from './privacy.types.ts';
import { privacyPolicyCopyEn } from './privacy-copy-en.model.ts';
import { privacyPolicyCopyEs } from './privacy-copy-es.model.ts';
import { privacyPolicyCopyFr } from './privacy-copy-fr.model.ts';
import { privacyPolicyCopyIt } from './privacy-copy-it.model.ts';
import { privacyPolicyCopyPtBr } from './privacy-copy-pt-br.model.ts';
import { privacyPolicyCopyZh } from './privacy-copy-zh.model.ts';
import type { PrivacyPolicyContentCopy } from './privacy-policy-content.types.ts';

const policyCopy: Partial<Record<string, PrivacyPolicyContentCopy>> = {
  'pt-br': privacyPolicyCopyPtBr,
  en: privacyPolicyCopyEn,
  fr: privacyPolicyCopyFr,
  es: privacyPolicyCopyEs,
  it: privacyPolicyCopyIt,
  zh: privacyPolicyCopyZh,
};

const references = [
  {
    label: 'Google Privacy Policy',
    url: 'https://policies.google.com/privacy',
  },
  {
    label: 'Google partner-site technologies',
    url: 'https://policies.google.com/technologies/partner-sites',
  },
  {
    label: 'ANPD cookie guidance (Brazil)',
    url: 'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/%40%40display-file/file',
  },
  {
    label: 'EU ePrivacy Directive',
    url: 'https://eur-lex.europa.eu/legal-content/en/TXT/?uri=CELEX%3A32002L0058',
  },
];

export function privacyPolicyContent(
  locale: string,
  contactURL: string,
  analyticsEnabled: boolean,
): PrivacyPolicyContent {
  const content = policyCopy[locale];

  if (!content) {
    throw new Error(`Missing privacy policy content: ${locale}`);
  }

  return {
    ...content,
    contactURL,
    analyticsEnabled,
    references,
  };
}
