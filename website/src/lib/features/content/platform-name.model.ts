export function platformName(url: string): string {
  const host = new URL(url).hostname.toLowerCase();

  if (host.includes('youtube') || host === 'youtu.be') {
    return 'YouTube';
  }

  if (host.split('.')[0] === 'github') {
    return 'GitHub';
  }

  return 'GitLab';
}
