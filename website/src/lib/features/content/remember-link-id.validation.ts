export function rememberLinkID(
  id: string,
  seen: Set<string>,
  label: string,
): void {
  if (seen.has(id)) {
    throw new Error(`Duplicate ${label}: ${id}`);
  }

  seen.add(id);
}
