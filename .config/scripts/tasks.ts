import { check } from './audit-task.ts';
import { build } from './build-task.ts';
import { checkFast, tests } from './fast-gates.ts';
import { syncFederation } from './federation.ts';
import { runCommand as command } from './process.ts';

export async function runCI(
  validate: () => Promise<void> = checkFast,
  generate: () => Promise<void> = build,
): Promise<void> {
  await validate();
  await generate();
}

if (import.meta.main) {
  const task = process.argv[2];

  try {
    function formatScript(): 'format' | 'format-fix' {
      if (task === 'format') {
        return 'format';
      }

      return 'format-fix';
    }

    function justFormatArguments(): string[] {
      if (task === 'format') {
        return [
          '--check',
        ];
      }

      return [];
    }

    switch (task) {
      case 'dev':
        await syncFederation();
        await command('node', [
          '.config/scripts/prepare-svelte-assets.ts',
        ]);
        await command('pnpm', [
          '--dir',
          'website',
          'run',
          'dev',
        ]);
        break;

      case 'build':
        await build();
        break;

      case 'lighthouse-baseline':
        await build('.local/build/lighthouse-baseline');
        await command('node', [
          '.config/scripts/lighthouse-baseline.ts',
        ]);
        break;

      case 'preview':
        await command('node', [
          '.config/scripts/static-server.ts',
        ]);
        break;

      case 'test':
        await tests();
        break;

      case 'check':
        await check();
        break;

      case 'check-fast':
        await checkFast();
        break;

      case 'ci':
        await runCI();
        break;

      case 'format':
      case 'format-fix':
        await command('pnpm', [
          '--dir',
          'website',
          'run',
          formatScript(),
        ]);
        await command('just', [
          '--fmt',
          ...justFormatArguments(),
        ]);
        break;

      default:
        throw new Error('Unknown task');
    }
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}
