export function federationSummary(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length > 12000) {
    throw new Error(`Invalid ${label}.summary`);
  }

  return value;
}
