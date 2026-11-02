<script lang="ts">
  import type { PageRecord } from '../features/content/content.types.ts';
  import { textOr } from '../features/content/text-or.model.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import { navigationPage } from '#lib/components/navigation-page.model.ts';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import {
    currentPage,
    enabledAttribute,
  } from '#lib/features/listings/presentation.model.ts';

  const {
    entry,
    active,
    nowShortcut = false,
  }: {
    entry: PageRecord;
    active: boolean;
    nowShortcut?: boolean;
  } = $props();

  const getNavigationPage = (): ReturnType<typeof navigationPage> => {
    return navigationPage(nowShortcut, entry);
  };

  const currentNavigationPage = $derived.by(getNavigationPage);
</script>

<NavigationLink
  class="section-menu-link"
  data-navigation-page={currentNavigationPage}
  data-now-shortcut={enabledAttribute(nowShortcut)}
  href={entry.url}
  aria-current={currentPage(active)}
>
  <IconButton name={textOr(entry.icon, 'link')} optical />
  <span>{entry.title}</span>
  {#if active}
    <span class="navigation-check">
      <IconButton name="check" />
    </span>
  {/if}
</NavigationLink>
