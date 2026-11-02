export function isModelModule(file: string): boolean {
  return /\.(?:model|validation|types)\.ts$/.test(file);
}
