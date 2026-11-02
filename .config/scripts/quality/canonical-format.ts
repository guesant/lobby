import { formatWithLayout } from './format-with-layout.ts';
import { formatWithPrettier } from './format-with-prettier.ts';
import { formattingOptions } from './formatting-options.ts';
import { needsLayoutFormatting } from './needs-layout-formatting.ts';

export async function canonicalFormat(
  source: string,
  filePath: string,
): Promise<string> {
  const options = await formattingOptions(filePath);

  if (needsLayoutFormatting(filePath)) {
    return formatWithLayout(source, filePath, options);
  }

  return formatWithPrettier(source, filePath, options);
}
