import { runDeploymentCommand } from './run-deployment-command.ts';
import { runPlanCommand } from './run-plan-command.ts';

export async function runCli(): Promise<void> {
  if (process.argv[2] === 'plan') {
    await runPlanCommand();

    return;
  }

  if (process.argv[2] === 'deployment') {
    await runDeploymentCommand();

    return;
  }

  throw new Error('Unknown CI policy command');
}
