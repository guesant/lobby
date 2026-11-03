import type { PrivacyPolicyContent } from './privacy.types.ts';

export const privacyPolicyCopyIt: Omit<
  PrivacyPolicyContent,
  'contactURL' | 'analyticsEnabled' | 'references'
> = {
  title: 'Informativa sulla Privacy',
  description:
    'Come questo sito tratta i dati di navigazione e le scelte di consenso.',
  contactLabel: 'Contatta via e-mail',
  inactiveNotice:
    'Google Analytics non è ancora attivo in questa versione del sito.',
  referencesLabel: 'Fonti e informazioni correlate',
  sections: [
    {
      title: 'Titolare del trattamento',
      paragraphs: [
        'Gabriel R. Antunes è responsabile del trattamento dei dati personali effettuato da questo sito. Domande e richieste sulla privacy possono essere inviate tramite il contatto indicato alla fine di questa pagina.',
      ],
    },
    {
      title: 'Analytics e dati misurati',
      paragraphs: [
        'Google Analytics viene caricato solo se dai il consenso. Se attivato, può misurare visualizzazioni di pagina, scorrimento, clic su link esterni, download, interazioni con video incorporati e moduli. I termini di ricerca non vengono inviati. Google Signals e la personalizzazione degli annunci sono disattivati nella configurazione del sito.',
        'Queste funzioni possono trattare gli indirizzi delle pagine visitate, la provenienza delle visite, informazioni tecniche sul browser e sul dispositivo e dati relativi alle interazioni misurate. Non inserire dati personali negli URL o nei contenuti destinati alla misurazione.',
      ],
    },
    {
      title: 'Finalità e scelta',
      paragraphs: [
        'La finalità è comprendere l’uso del sito e orientarne i miglioramenti. La misurazione dipende dalla tua scelta: prima del consenso, il tag Google non viene caricato e nessun dato Analytics viene inviato. Puoi rifiutare o revocare il consenso nelle Impostazioni.',
      ],
    },
    {
      title: 'Google e trasferimenti',
      paragraphs: [
        'Quando acconsenti, i dati vengono inviati a Google Analytics, un servizio fornito da Google. Google può trattarli su infrastrutture situate in altri Paesi, secondo i propri termini e le proprie politiche. Consulta anche l’informativa sulla privacy di Google e le informazioni sulle tecnologie usate nei siti partner.',
      ],
    },
    {
      title: 'Conservazione',
      paragraphs: [
        'Il periodo previsto per la conservazione dei dati di eventi e utenti Analytics è di due mesi. I report aggregati standard possono seguire controlli e periodi distinti di Google Analytics. La scelta di consenso viene salvata in questo browser per sei mesi e può essere modificata prima.',
      ],
    },
    {
      title: 'Diritti e contatto',
      paragraphs: [
        'Puoi chiedere informazioni sul trattamento, esercitare i diritti applicabili in materia di protezione dei dati o revocare il consenso. Le richieste saranno valutate secondo la legge applicabile e i dati disponibili. La revoca interrompe nuove misurazioni da parte del sito, ma non cancella automaticamente i dati già ricevuti da Google; se applicabile, la cancellazione va richiesta anche al fornitore.',
      ],
    },
  ],
};
