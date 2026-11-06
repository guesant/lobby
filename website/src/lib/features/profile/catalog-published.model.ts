export function catalogPublished(item: Record<string, unknown>): boolean {
  return (
    item['public'] !== false &&
    item['enabled'] !== false &&
    !item['private'] &&
    !item['draft']
  );
}
