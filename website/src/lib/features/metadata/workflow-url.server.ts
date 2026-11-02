export function workflowURL(repositoryURL: string, runID: string): string {
  if (runID) {
    return `${repositoryURL}/actions/runs/${runID}`;
  }

  return repositoryURL;
}
