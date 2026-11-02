export function federationFetchTimestamp(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    throw new Error('Invalid federation fetch timestamp');
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    throw new Error('Invalid federation fetch timestamp');
  }

  return value;
}
