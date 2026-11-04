export type DocumentPresentation = {
  language: string;
  interfaceName: string;
  bodyClass: string;
  page: string;
  earlyHead: string;
};

export type DocumentContext = {
  language: string;
  interfaceName: 'voxel' | 'terminal';
  pathname: string;
};
