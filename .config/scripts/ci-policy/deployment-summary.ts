export function deploymentSummary(
  current: boolean,
  source: string,
  main: string,
): string {
  if (current) {
    return `Deploying current main ${source}.`;
  }

  return `Deployment skipped: built ${source}, but main is now ${main}.`;
}
