import { resolve } from 'node:path';
import * as prettier from 'prettier';

export function formattingOptions(
  filePath: string,
): Promise<prettier.Options | null> {
  const configurationPath = resolve('website/prettier.config.js');

  return prettier.resolveConfig(filePath, {
    config: configurationPath,
  });
}
