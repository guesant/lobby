export function formatArguments(task: string | undefined): string[] {
  if (task === 'format') {
    return [
      '--check',
    ];
  }

  return [];
}
