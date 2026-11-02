export function enabledAttribute(enabled: boolean): true | undefined {
  if (enabled) {
    return true;
  }

  return undefined;
}
