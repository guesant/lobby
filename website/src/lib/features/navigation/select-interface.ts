import type { InterfaceDependencies } from './interface-controller.types.ts';
import { interfaceDestination } from './interface-destination.model.ts';

export async function selectInterface(
  dependencies: InterfaceDependencies,
  selected: string,
): Promise<void> {
  const page = dependencies.page();

  if (
    selected === page.interfaceName ||
    (selected !== 'minecraft' && selected !== 'terminal')
  ) {
    return;
  }

  let path = page.standardPageURL;

  if (selected === 'terminal') {
    path = page.terminalPageURL;
  }

  const currentURL = dependencies.currentURL();

  const target = interfaceDestination(
    currentURL,
    path,
    selected === 'terminal',
  );

  dependencies.closeDialog();
  await dependencies.navigate(target);
}
