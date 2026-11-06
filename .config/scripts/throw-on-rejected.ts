export function throwOnRejected(
  results: PromiseSettledResult<unknown>[],
  message: string,
): void {
  const failures: unknown[] = [];

  for (const result of results) {
    if (result.status === 'rejected') {
      failures.push(result.reason);
    }
  }

  if (failures.length > 0) {
    throw new AggregateError(failures, message);
  }
}
