import { runCommand as command } from '../process.ts';

export async function tests(): Promise<void> {
  await command('node', [
    '--test',
    '.config/scripts/check-stats.ts',
    '.config/scripts/check-public-resources.test.ts',
    '.config/scripts/check-pointer-sound.ts',
    '.config/scripts/check-link-view.ts',
    '.config/scripts/check-federation.ts',
    '.config/scripts/check-search.ts',
    '.config/scripts/check-security-fuzz.test.ts',
    '.config/scripts/check-security-gates.test.ts',
    '.config/scripts/check-code-spacing.test.ts',
    '.config/scripts/check-one-function-per-file.test.ts',
    '.config/scripts/check-no-nested-call-arguments.test.ts',
    '.config/scripts/check-svelte-layout.test.ts',
    '.config/scripts/check-architecture.test.ts',
    '.config/scripts/check-ci.test.ts',
    '.config/scripts/check-publish-stats.test.ts',
  ]);
}
