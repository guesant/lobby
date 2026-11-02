export function jsonScriptContent(serialized: string): string {
  return serialized.replaceAll('<', '\\u003c');
}
