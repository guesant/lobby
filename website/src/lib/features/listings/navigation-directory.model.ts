export function navigationDirectory(id: string): string {
  if (id === 'home') {
    return '~';
  }

  return id;
}
