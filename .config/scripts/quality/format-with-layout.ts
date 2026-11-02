import { formatPass } from './format-pass.ts';
import type * as prettier from 'prettier';

export async function formatWithLayout(
  source: string,
  filePath: string,
  options: prettier.Options | null,
): Promise<string> {
  let current = source;

  for (let pass = 0; pass < 5; pass += 1) {
    const output = await formatPass(current, filePath, options);

    if (output === current) {
      return output;
    }

    current = output;
  }

  throw new Error(`Canonical formatting did not converge: ${filePath}`);
}
