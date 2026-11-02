import { runCommand } from '../process.ts';
import { formatArguments } from './format-arguments.ts';
import { formatScriptName } from './format-script-name.ts';

export async function runFormat(): Promise<void> {
  const task = process.argv[2];

  const scriptName = formatScriptName(task);

  await runCommand('pnpm', [
    '--dir',
    'website',
    'run',
    scriptName,
  ]);

  const argumentsList = formatArguments(task);

  await runCommand('just', [
    '--fmt',
    ...argumentsList,
  ]);
}
