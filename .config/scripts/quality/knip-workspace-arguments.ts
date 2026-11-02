export function knipWorkspaceArguments(): string[] {
  if (process.env['TOOLING_PROFILE'] === 'audit') {
    return [];
  }

  return [
    '--workspace',
    '.',
    '--workspace',
    '../.config',
  ];
}
