export function linkActionClass(preview: boolean): string {
  if (preview) {
    return 'link-button category-preview-link';
  }

  return 'link-button';
}
