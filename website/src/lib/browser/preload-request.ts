export function preloadRequest(input: {
  type: string
}): boolean {
  return input.type !== 'js' && input.type !== 'font';
}
