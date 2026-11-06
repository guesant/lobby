export function profileRevision(): string {
  for (const key of [
    'LOBBY_SOURCE_SHA',
    'GITHUB_SHA',
  ]) {
    const value = process.env[key];

    if (value) {
      if (!/^[a-f0-9]{40}$/u.test(value)) {
        throw new Error('Invalid profile source revision');
      }

      return value;
    }
  }

  return 'local';
}
