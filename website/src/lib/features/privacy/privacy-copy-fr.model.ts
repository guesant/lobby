import type { PrivacyPolicyContent } from './privacy.types.ts';

export const privacyPolicyCopyFr: Omit<
  PrivacyPolicyContent,
  'contactURL' | 'analyticsEnabled' | 'references'
> = {
  title: 'Politique de Confidentialité',
  description:
    'Comment ce site traite les données de navigation et les choix de consentement.',
  contactLabel: 'Contacter par e-mail',
  inactiveNotice:
    'Google Analytics n’est pas encore actif sur cette version du site.',
  referencesLabel: 'Sources et informations complémentaires',
  sections: [
    {
      title: 'Responsable du traitement',
      paragraphs: [
        'Gabriel R. Antunes est responsable du traitement des données personnelles effectué par ce site. Les questions et demandes relatives à la confidentialité peuvent être envoyées à l’adresse indiquée à la fin de cette page.',
      ],
    },
    {
      title: 'Analytics et données mesurées',
      paragraphs: [
        'Google Analytics n’est chargé que si vous l’acceptez. Une fois activé, il peut mesurer les pages consultées, le défilement, les clics sur des liens externes, les téléchargements, l’engagement avec les vidéos intégrées et les interactions avec les formulaires. Les termes de recherche ne sont pas envoyés. Google Signals et la personnalisation publicitaire sont désactivés dans la configuration du site.',
        'Ces fonctions peuvent traiter les adresses des pages consultées, la provenance des visites, des informations techniques sur le navigateur et l’appareil ainsi que des données liées aux interactions mesurées. Ne placez pas de données personnelles dans les URL ou dans le contenu destiné à la mesure.',
      ],
    },
    {
      title: 'Finalité et choix',
      paragraphs: [
        'La finalité est de comprendre l’utilisation du site et de guider ses améliorations. La mesure dépend de votre choix : avant votre accord, la balise Google n’est pas chargée et aucune donnée Analytics n’est envoyée. Vous pouvez refuser ou retirer votre consentement dans les réglages.',
      ],
    },
    {
      title: 'Google et transferts',
      paragraphs: [
        'Si vous acceptez, les données sont envoyées à Google Analytics, un service fourni par Google. Google peut les traiter sur des infrastructures situées dans d’autres pays, conformément à ses conditions et politiques. Consultez également la politique de confidentialité de Google et ses informations sur les technologies utilisées sur les sites partenaires.',
      ],
    },
    {
      title: 'Conservation',
      paragraphs: [
        'La durée prévue pour les données d’événement et d’utilisateur d’Analytics est de deux mois. Les rapports agrégés standards peuvent suivre des contrôles et durées distincts de Google Analytics. Votre choix de consentement est conservé dans ce navigateur pendant six mois et peut être modifié avant cette échéance.',
      ],
    },
    {
      title: 'Vos droits et contact',
      paragraphs: [
        'Vous pouvez demander des informations sur le traitement, exercer les droits applicables en matière de protection des données ou retirer votre consentement. Les demandes sont traitées selon la loi applicable et les données disponibles. Le retrait arrête les nouvelles mesures du site, mais ne supprime pas automatiquement les données déjà reçues par Google ; le cas échéant, leur suppression doit aussi être demandée au fournisseur.',
      ],
    },
  ],
};
