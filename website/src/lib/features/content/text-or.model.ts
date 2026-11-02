export function textOr<Fallback extends string | null | undefined>(
  value: string | null | undefined,
  fallback: Fallback,
): string | Fallback {
  if (value) {
    return value;
  }

  return fallback;
}
