import { security } from '../security-gates.ts';

export async function runCoreAudits(): Promise<unknown[]> {
  const failures: unknown[] = [];

  try {
    await security();
  } catch (error) {
    failures.push(error);
  }

  return failures;
}
