export function isVisualModule(specifier: string): boolean {
  return (
    specifier.endsWith('.svelte') ||
    /\/(?:interfaces|components)\//.test(specifier)
  );
}
