export function assertSnapshotRepository(
  repository: string[] | undefined,
): asserts repository is [
  string,
  string,
] {
  if (repository?.length !== 2) {
    throw new Error('GITHUB_REPOSITORY must contain an owner and repository');
  }
}
