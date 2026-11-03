export type BootStyle = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  backgroundImage: string;
  borderImageSource: string;
  boxShadow: string;
  textShadow: string;
  cursor: string;
};

export type BootPresentation = {
  styles: BootStyle[];
  fullscreen: boolean;
  covered: boolean;
  backdrop: string;
  hiddenStatus: boolean;
  horizontalOverflow: boolean;
};

export type BiosRoute = {
  language: string;
  interfaceName: string;
  url: string;
};
