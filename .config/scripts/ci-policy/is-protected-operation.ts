export function isProtectedOperation(operation: string): boolean {
  return [
    'publish',
    'statistics',
    'codeql',
  ].includes(operation);
}
