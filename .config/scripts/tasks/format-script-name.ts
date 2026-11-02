export function formatScriptName(
  task: string | undefined,
): 'format' | 'format-fix' {
  if (task === 'format') {
    return 'format';
  }

  return 'format-fix';
}
