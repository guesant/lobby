export function requiredSearchFieldsValid(
  item: Record<string, unknown>,
  fields: string[],
): boolean {
  for (const field of fields) {
    if (typeof item[field] !== 'string') {
      return false;
    }
  }

  return true;
}
