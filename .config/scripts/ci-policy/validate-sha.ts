export function validateSha(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{40}$/.test(value)) {
    throw new Error('Invalid CI source SHA');
  }

  return value;
}
