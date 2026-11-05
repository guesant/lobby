import { checkFast } from '../fast-gates.ts';
import { security } from '../security-gates.ts';

export async function runCoreAudits(): Promise<unknown[]> {
  const failures: unknown[] = [];

  try {
    await checkFast();
  } catch (error) {
    failures.push(error);
  }

  try {
    await security();
  } catch (error) {
    failures.push(error);
  }

  return failures;
}
