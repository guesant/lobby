export function editorialVisible(entry: {
  enabled?: boolean;
  public?: boolean;
  private?: boolean;
  draft?: boolean;
}): boolean {
  return (
    entry.enabled !== false &&
    entry.public !== false &&
    !entry.private &&
    !entry.draft
  );
}
