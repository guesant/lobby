<script lang="ts">
  import type { DisplayLinkRecord } from '../features/content/content.types.ts';
  import ContentListHeading from '#lib/components/ContentListHeading.svelte';
  import LinkCard from '#lib/components/LinkCard.svelte';
  import type { ListingDestination } from '#lib/features/listings/listing.types.ts';

  const {
    items,
    ui,
    thirdPartyLabel,
    destination,
    preview = false,
    sectionID,
    headingLevel = 3,
  }: {
    items: DisplayLinkRecord[];
    ui: Record<string, string>;
    thirdPartyLabel: string;
    destination: ListingDestination;
    preview?: boolean;
    sectionID: string;
    headingLevel?: 2 | 3 | 4;
  } = $props();
</script>

{#if items.length}
  <section class="content-link-group" id="links-{sectionID}">
    <ContentListHeading label={ui['links']} level={headingLevel} />
    <ul class:category-preview={preview} class="link-list divided-list">
      {#each items as item (item.id)}
        <li class="link-row">
          <LinkCard {item} {thirdPartyLabel} {destination} {preview} />
        </li>
      {/each}
    </ul>
  </section>
{/if}
