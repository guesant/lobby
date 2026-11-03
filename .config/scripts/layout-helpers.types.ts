export type PreviewRecord = {
  id: string | undefined;
  href: string;
};

export type CategoryPreviews = {
  id: string | undefined;
  previews: PreviewRecord[];
};
