import type { VerifiedLink } from './verify-links.types.ts';

export function writeLinkSummary(
  unique: number,
  verified: VerifiedLink[],
): void {
  const summary = {
    unique,
    errors: 0,
    verified_retries: verified,
  };

  const serializedSummary = JSON.stringify(summary);

  console.log(serializedSummary);
}
