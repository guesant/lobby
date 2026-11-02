export function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  };

  if (process.env['GITHUB_STATS_TOKEN']) {
    headers['Authorization'] = `Bearer ${process.env['GITHUB_STATS_TOKEN']}`;
  }

  return headers;
}
