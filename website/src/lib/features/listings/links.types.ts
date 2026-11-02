import type { linksForSection } from '../navigation/routes.model.ts';

export type ConfiguredLink = ReturnType<typeof linksForSection>[number];
