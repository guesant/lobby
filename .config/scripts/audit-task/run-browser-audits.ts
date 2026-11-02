import { accessibilityAudits } from '../accessibility-audits.ts';
import { withStaticServer } from '../static-server.ts';
import { runAuditsAtServer } from './run-audits-at-server.ts';

export async function runBrowserAudits(): Promise<void> {
  const {
    pa11y,
    measuredCount
  } = accessibilityAudits();

  const auditTask = runAuditsAtServer.bind(null, pa11y, measuredCount);

  await withStaticServer(auditTask);
}
