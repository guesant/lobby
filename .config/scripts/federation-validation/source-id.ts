export function sourceID(value: string): 'blog' | 'resume' {
  if (value !== 'blog' && value !== 'resume') {
    throw new Error('Invalid federation source');
  }

  return value;
}
