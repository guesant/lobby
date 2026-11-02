export function validateLinkReferences(
  ids: string[],
  catalog: Set<string>,
  label: string,
): void {
  for (const id of ids) {
    if (!catalog.has(id)) {
      throw new Error(`Unknown ${label}: ${id}`);
    }
  }
}
