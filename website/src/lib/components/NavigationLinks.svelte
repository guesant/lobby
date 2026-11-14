<script lang="ts">
  import type { PageRecord } from '../features/content/content.types.ts';
  import { resolve } from '$app/paths';
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
      <a
        data-navigation-page={entry.id}
        data-now-shortcut={emptyAttribute(entry.id === 'now')}
        href={resolve(entry.url.slice(1))}
        aria-current={currentPage(entry.id === currentID)}
      >
        {entry.title}
      </a>
    </li>
  {/each}
</ul>
