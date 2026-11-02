import { build } from '../build-task.ts';
import { checkFast } from '../fast-gates.ts';

export async function runCI(
  validate: () => Promise<void> = checkFast,
  generate: () => Promise<void> = build,
): Promise<void> {
  await validate();
  await generate();
}
