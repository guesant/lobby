import type { Linter } from 'eslint';
import { ESLint } from 'eslint';
import { resolve } from 'node:path';

let formatter: ESLint | undefined;

export function layoutFormatter(
  fix: (message: Linter.LintMessage) => boolean,
): ESLint {
  formatter ??= new ESLint({
    overrideConfigFile: resolve('website/eslint.config.js'),
    fix,
  });

  return formatter;
}
