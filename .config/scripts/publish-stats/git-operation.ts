const operations = new Set([
  'rev-parse',
  'diff',
  'ls-remote',
  'commit',
  'push',
]);

export function gitOperation(args: string[]): string {
  for (const argument of args) {
    if (operations.has(argument)) {
      return argument;
    }
  }

  return 'command';
}
