import { build } from '../build-task.ts';
import { checkFast } from '../fast-gates.ts';
import { throwOnRejected } from '../throw-on-rejected.ts';

export async function runCI(
  validate: () => Promise<void> = checkFast,
  generate: () => Promise<void> = build,
): Promise<void> {
  const validation = validate();

  const siteBuild = generate();

  const results = await Promise.allSettled([
    validation,
    siteBuild,
  ]);

  throwOnRejected(results, 'CI validation or site build failed');
}
