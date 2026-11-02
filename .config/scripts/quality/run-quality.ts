import { runCommand as command } from '../process.ts';
import { formatFiles } from './format-files.ts';
import { lintCode } from './lint-code.ts';
import { lintContracts } from './lint-contracts.ts';

export async function runQuality(): Promise<void> {
  const operation = process.argv[2];

  if (operation === 'format' || operation === 'format-fix') {
    await formatFiles(operation === 'format-fix');

    return;
  }

  if (operation === 'lint-fix') {
    await command('eslint', [
      '--config',
      'website/eslint.config.js',
      '.',
      '--fix',
    ]);

    return;
  }

  if (operation !== 'lint') {
    throw new Error('Unknown quality operation');
  }

  await lintCode();
  await lintContracts();
}
