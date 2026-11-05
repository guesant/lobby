import { check, checkAuditStage } from '../audit-task.ts';
import { build } from '../build-task.ts';
import { checkFast, tests } from '../fast-gates.ts';
import { reportTaskError } from './report-task-error.ts';
import { runCI } from './run-ci.ts';
import { runDev } from './run-dev.ts';
import { runFormat } from './run-format.ts';
import { runLighthouseBaseline } from './run-lighthouse-baseline.ts';
import { runPreview } from './run-preview.ts';

const tasks: Record<string, () => Promise<void>> = {
  dev: runDev,
  build,
  'lighthouse-baseline': runLighthouseBaseline,
  preview: runPreview,
  test: tests,
  check,
  'check-audit-stage': checkAuditStage,
  'check-fast': checkFast,
  ci: runCI,
  format: runFormat,
  'format-fix': runFormat,
};

export async function runTask(): Promise<void> {
  const task = process.argv[2];

  let handler: (() => Promise<void>) | undefined;

  if (task) {
    handler = tasks[task];
  }

  if (!handler) {
    throw new Error('Unknown task');
  }

  try {
    await handler();
  } catch (error) {
    reportTaskError(error);
  }
}
