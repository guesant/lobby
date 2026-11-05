import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pipeline } from 'node:stream/promises';

export async function runSarifCommand(
  name: string,
  args: string[],
  reportPath: string,
): Promise<number> {
  const reportDirectory = dirname(reportPath);

  await mkdir(reportDirectory, {
    recursive: true,
  });

  const child = spawn(name, args, {
    stdio: [
      'ignore',
      'pipe',
      'inherit',
    ],
  });

  const closeEvent = once(child, 'close') as Promise<
    [
      number | null,
      NodeJS.Signals | null,
    ]
  >;

  const reportOutput = createWriteStream(reportPath);

  const outputWriting = pipeline(child.stdout, reportOutput);

  const completion = await Promise.all([
    closeEvent,
    outputWriting,
  ]);

  const closeData = completion[0];

  const exitCode = closeData[0];

  const exitSignal = closeData[1];

  if (exitCode === null) {
    const signal = String(exitSignal);

    throw new Error(`${name} terminated: ${signal}`);
  }

  return exitCode;
}
