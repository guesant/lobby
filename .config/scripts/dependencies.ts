import { installDependencies } from './install-dependencies.ts';

if (process.env['LINKS_CONTAINER'] !== '1') {
  throw new Error('Dependencies must be installed through Docker');
}

if (
  process.argv.includes('--audit') &&
  process.env['TOOLING_PROFILE'] !== 'audit'
) {
  throw new Error(
    'The complete audit requires the workspace-audit Docker target',
  );
}

await installDependencies('website');
