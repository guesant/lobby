type FormattingResult = {
  fatalErrorCount: number;
  messages: unknown[];
  output: string | undefined;
};

export function formattingOutput(
  result: FormattingResult | undefined,
  formatted: string,
  filePath: string,
): string {
  if (!result || result.fatalErrorCount) {
    throw new Error(
      `Cannot format ${filePath}: ${JSON.stringify(result?.messages)}`,
    );
  }

  return result.output ?? formatted;
}
