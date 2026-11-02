import * as prettier from 'prettier';

export function formatWithPrettier(
  source: string,
  filePath: string,
  options: prettier.Options | null,
): Promise<string> {
  return prettier.format(source, {
    ...options,
    filepath: filePath,
  });
}
