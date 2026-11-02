import { runLinkVerification } from './verify-links/run-link-verification.ts';

export type {
  LinkFailure,
  LinkRequester,
  VerifiedLink,
} from './verify-links/verify-links.types.ts';
export { verifyTransientFailures } from './verify-links/verify-transient-failures.ts';

if (import.meta.main) {
  try {
    await runLinkVerification();
  } catch (error) {
    const message = String(error);

    console.error(message);
    process.exitCode = 1;
  }
}
