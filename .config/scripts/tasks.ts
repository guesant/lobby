import { runTask } from './tasks/run-task.ts';

export { runCI } from './tasks/run-ci.ts';

if (import.meta.main) {
  await runTask();
}
