export function reportTaskError(error: unknown): void {
  const message = String(error);

  console.error(message);
  process.exitCode = 1;
}
