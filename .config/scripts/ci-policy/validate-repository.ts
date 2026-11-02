export function validateRepository(value: unknown): string {
  if (typeof value !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(value)) {
    throw new Error('Invalid CI repository');
  }

  return value;
}
