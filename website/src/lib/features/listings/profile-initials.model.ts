export function profileInitials(name: string): string {
  const parts = name.trim()
    .split(/\s+/);

  const first = parts[0]?.[0] ?? '';

  if (parts.length < 2) {
    return first;
  }

  return `${first}${parts.at(-1)?.[0] ?? ''}`;
}
