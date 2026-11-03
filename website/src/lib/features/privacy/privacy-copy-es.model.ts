import type { PrivacyPolicyContent } from './privacy.types.ts';

export const privacyPolicyCopyEs: Omit<
  PrivacyPolicyContent,
  'contactURL' | 'analyticsEnabled' | 'references'
> = {
  title: 'Política de Privacidad',
  description:
    'Cómo trata este sitio los datos de navegación y las decisiones de consentimiento.',
  contactLabel: 'Contactar por correo electrónico',
  inactiveNotice:
    'Google Analytics aún no está activo en esta versión del sitio.',
  referencesLabel: 'Fuentes e información relacionada',
  sections: [
    {
      title: 'Responsable',
      paragraphs: [
        'Gabriel R. Antunes es responsable del tratamiento de datos personales realizado por este sitio. Las consultas y solicitudes de privacidad pueden enviarse mediante el contacto indicado al final de esta página.',
      ],
    },
    {
      title: 'Analytics y datos medidos',
      paragraphs: [
        'Google Analytics solo se carga si aceptas. Cuando está activado, puede medir páginas vistas, desplazamiento, clics en enlaces externos, descargas, interacción con vídeos incrustados e interacciones con formularios. No se envían términos de búsqueda. Google Signals y la personalización publicitaria están desactivados en la configuración del sitio.',
        'Estas funciones pueden procesar las direcciones de las páginas visitadas, el origen de las visitas, información técnica del navegador y del dispositivo, y datos asociados a las interacciones medidas. No incluyas información personal en URL ni en contenido destinado a la medición.',
      ],
    },
    {
      title: 'Finalidad y elección',
      paragraphs: [
        'La finalidad es comprender el uso del sitio y orientar mejoras. La medición depende de tu elección: antes de aceptar, la etiqueta de Google no se carga y no se envían datos de Analytics. Puedes rechazar o retirar el consentimiento en Ajustes.',
      ],
    },
    {
      title: 'Google y transferencias',
      paragraphs: [
        'Cuando aceptas, los datos se envían a Google Analytics, un servicio de Google. Google puede procesarlos en infraestructuras situadas en otros países, conforme a sus condiciones y políticas. También puedes consultar la política de privacidad de Google y la información sobre tecnologías usadas en sitios asociados.',
      ],
    },
    {
      title: 'Conservación',
      paragraphs: [
        'La retención prevista para los datos de eventos y usuarios de Analytics es de dos meses. Los informes agregados estándar pueden seguir controles y períodos propios de Google Analytics. La elección de consentimiento se guarda en este navegador durante seis meses y puede cambiarse antes.',
      ],
    },
    {
      title: 'Tus derechos y contacto',
      paragraphs: [
        'Puedes solicitar información sobre el tratamiento, ejercer los derechos de protección de datos aplicables o retirar el consentimiento. Las solicitudes se evaluarán conforme a la legislación aplicable y los datos disponibles. Retirarlo detiene nuevas mediciones del sitio, pero no elimina automáticamente datos ya recibidos por Google; cuando corresponda, también debes solicitar la eliminación al proveedor.',
      ],
    },
  ],
};
