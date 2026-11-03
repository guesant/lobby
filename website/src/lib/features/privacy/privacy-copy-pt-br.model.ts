import type { PrivacyPolicyContent } from './privacy.types.ts';

export const privacyPolicyCopyPtBr: Omit<
  PrivacyPolicyContent,
  'contactURL' | 'analyticsEnabled' | 'references'
> = {
  title: 'Política de Privacidade',
  description:
    'Como este site trata dados de navegação e escolhas de consentimento.',
  contactLabel: 'Entre em contato por e-mail',
  inactiveNotice:
    'O Google Analytics ainda não está ativo nesta versão do site.',
  referencesLabel: 'Fontes e informações relacionadas',
  sections: [
    {
      title: 'Responsável',
      paragraphs: [
        'Gabriel R. Antunes é o responsável pelo tratamento de dados pessoais realizado por este site. Dúvidas e solicitações sobre privacidade podem ser enviadas pelo contato indicado ao final desta página.',
      ],
    },
    {
      title: 'Analytics e dados medidos',
      paragraphs: [
        'O Google Analytics será carregado somente se você aceitar. Quando ativado, poderá medir visualizações de página, rolagem, cliques em links externos, downloads, interação com vídeos incorporados e interações com formulários. Termos de busca não são enviados. A configuração do site também desativa Google Signals e personalização de anúncios.',
        'Esses recursos podem processar endereço das páginas visitadas, origem da visita, informações técnicas do navegador e dispositivo e dados associados às interações medidas. Não envie informações pessoais em URLs ou em conteúdo destinado à medição.',
      ],
    },
    {
      title: 'Finalidade e escolha',
      paragraphs: [
        'A finalidade é compreender o uso do site e orientar melhorias. A medição depende da sua escolha: antes do aceite, a tag do Google não é carregada e nenhum dado de Analytics é enviado. Você pode rejeitar ou revogar o consentimento nas Configurações.',
      ],
    },
    {
      title: 'Google e transferências',
      paragraphs: [
        'Quando você aceita, os dados são enviados ao Google Analytics, serviço fornecido pela Google. O Google pode processá-los em infraestrutura localizada em outros países, conforme seus termos e políticas. Consulte também a política de privacidade e as informações sobre tecnologias utilizadas em sites parceiros do Google.',
      ],
    },
    {
      title: 'Retenção',
      paragraphs: [
        'A configuração prevista para dados de evento e de usuário do Analytics é de dois meses. Relatórios agregados padrão podem seguir períodos e controles próprios do Google Analytics. A escolha de consentimento fica salva neste navegador por seis meses e pode ser alterada antes disso.',
      ],
    },
    {
      title: 'Seus direitos e contato',
      paragraphs: [
        'Você pode solicitar informações sobre o tratamento, exercer os direitos aplicáveis previstos na legislação de proteção de dados ou retirar seu consentimento. A solicitação será avaliada conforme a lei aplicável e os dados disponíveis. A retirada impede novas medições pelo site, mas não apaga automaticamente dados já recebidos pelo Google; quando aplicável, a exclusão também deve ser solicitada ao provedor.',
      ],
    },
  ],
};
