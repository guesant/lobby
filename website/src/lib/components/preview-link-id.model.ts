export function previewLinkID(
  preview: boolean,
  itemID: string,
): string | undefined {
  if (preview) {
    return itemID;
  }

  return undefined;
}
