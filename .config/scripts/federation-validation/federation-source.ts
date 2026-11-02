export function federationSource(source: string): 'blog' | 'resume' {
  if (source !== 'blog' && source !== 'resume') {
    throw new Error(`Unknown federation source: ${source}`);
  }

  return source;
}
