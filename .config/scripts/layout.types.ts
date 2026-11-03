import type { pagesFor } from './configuration.ts';

export type LayoutSnapshot = {
  regionsAligned: boolean;
  overflow: boolean;
  mainContentGeometry: boolean;
  cardsAligned: boolean;
  statisticsAligned: boolean;
  navigationCompact: boolean;
  controlsFit: boolean;
  columns: number[];
  languageControls: number;
  noControlMotion: boolean;
  railConnections: boolean;
  railContentClearance: boolean;
  anchoredLanterns: boolean;
  repeatingFrames: boolean;
  iconBoxes: boolean;
  opticalIcons: boolean;
  quickContactsTransparent: boolean;
  thirdPartyBadges: boolean;
  coloredIcons: boolean;
  beveledIcons: boolean;
  localIcons: boolean;
  externalLinks: boolean;
  footerDisclaimer: boolean;
  calendarUptime: boolean;
  statisticsImages: number;
  numericValuesFit: boolean;
  brokenImages: number;
  uniformMedia: boolean;
  galleryColumns: number;
  categoryPreviewColumns: boolean;
  rusticGeometry: boolean;
  contiguousLists: boolean;
  squareQuickAccess: boolean;
  layeredBackground: boolean;
  deferredOrnaments: boolean;
  minimalContext: boolean;
  galleryAligned: boolean;
  galleryLinksAccessible: boolean;
  footerAligned: boolean;
  settingsClosed: boolean;
  isolatedPreferences: boolean;
};

export type LayoutRoute = ReturnType<typeof pagesFor>[number] & {
  language: string;
};
