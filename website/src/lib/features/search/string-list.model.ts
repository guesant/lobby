export function stringList(value: unknown): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (const entry of value) {
    if (typeof entry !== 'string') {
      return false;
    }
  }

  return true;
}
