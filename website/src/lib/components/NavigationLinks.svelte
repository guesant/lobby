<script lang="ts">
  import type { PageRecord } from '../features/content/content.types.ts';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import {
    currentPage,
    emptyAttribute,
  } from '#lib/features/listings/presentation.model.ts';

  const {
    pages,
    currentID,
    placement,
  }: {
    pages: PageRecord[];
    currentID: string;
    placement: 'header' | 'footer';
  } = $props();
</script>

<ul class="navigation-links {placement}-navigation-links">
  {#each pages as entry (entry.id)}
    <li>
      <NavigationLink
        data-navigation-page={entry.id}
        data-now-shortcut={emptyAttribute(entry.id === 'now')}
        href={entry.url}
        aria-current={currentPage(entry.id === currentID)}
      >
        {entry.title}
      </NavigationLink>
    </li>
  {/each}
</ul>
