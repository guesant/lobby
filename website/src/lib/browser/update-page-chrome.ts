import type { PageLoadData } from '../features/content/content.types.ts';
import { interfaceBodyClass } from '../features/navigation/navigation.viewmodel.ts';
import { page } from '$app/state';

export function updatePageChrome(): void {
  const data = page.data as PageLoadData;

  const interfaceName = data.interfaceName;

  document.documentElement.dataset['interface'] = interfaceName;
  document.documentElement.dataset['page'] = data.page.id;
  document.documentElement.lang = data.localized.ui.html_lang;
  document.body.className = interfaceBodyClass();
}
