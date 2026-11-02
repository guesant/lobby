import type { Source } from '../federation.types.ts';

export function contentURL(
  content: string,
  source: Source,
  type: unknown,
): string {
  const destination = new URL(content);

  if (
    source.id !== 'resume' ||
    type !== 'project' ||
    destination.protocol !== 'https:' ||
    destination.username ||
    destination.password ||
    destination.port ||
    ![
      'github.com',
      'gitlab.com',
      'www.youtube.com',
      'youtube.com',
      'youtu.be',
    ].includes(destination.hostname)
  ) {
    throw new Error('Invalid public content URL');
  }

  return destination.href;
}
