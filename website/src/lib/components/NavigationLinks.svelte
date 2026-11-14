<script lang="ts">
  import type { PageRecord } from '../features/content/content.types.ts';
  import {
    currentPage,
    emptyAttribute,
  } from '#lib/features/listings/presentation.model.ts';
  import { resolve } from '$app/paths';

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
    {@const path = entry.url.slice(1)}
    <li>
      <a
        data-navigation-page={entry.id}
        data-now-shortcut={emptyAttribute(entry.id === 'now')}
        href={resolve(path)}
        aria-current={currentPage(entry.id === currentID)}
      >
        {entry.title}
      </a>
    </li>
  {/each}
</ul>
