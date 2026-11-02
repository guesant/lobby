import type { PageLoadData } from '../content/content.types.ts';
import { interfaceDestination } from './interface.model.ts';

type InterfaceDependencies = {
  page(): PageLoadData;
  currentURL(): URL;
  closeDialog(): void;
  navigate(url: URL): Promise<void>;
};

export function createInterfaceController(
  dependencies: InterfaceDependencies,
): {
  select: (selected: string) => Promise<void>;
} {
  async function select(selected: string): Promise<void> {
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

    const target = interfaceDestination(
      dependencies.currentURL(),
      path,
      selected === 'terminal',
    );

    dependencies.closeDialog();
    await dependencies.navigate(target);
  }

  return {
    select,
  };
}
