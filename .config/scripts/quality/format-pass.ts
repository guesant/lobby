import { formattingFix } from './formatting-fix.ts';
import { formattingOutput } from './formatting-output.ts';
import { layoutFormatter } from './layout-formatter.ts';
import * as prettier from 'prettier';

export async function formatPass(
  source: string,
  filePath: string,
  options: prettier.Options | null,
): Promise<string> {
  const formatted = await prettier.format(source, {
    ...options,
    filepath: filePath,
  });

  const formatter = layoutFormatter(formattingFix);

  const [
    result,
  ] = await formatter.lintText(formatted, {
    filePath,
  });

  return formattingOutput(
    {
      fatalErrorCount: result?.fatalErrorCount ?? 1,
      messages: result?.messages ?? [],
      output: result?.output,
    },
    formatted,
    filePath,
  );
}
