export function emptyAttribute(enabled: boolean): '' | undefined {
  if (enabled) {
    return '';
  }

  return undefined;
}
