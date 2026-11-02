<script lang="ts">
  import type {
    DisplayLinkRecord,
    EditorialRecord,
    PageRecord,
  } from '../features/content/content.types.ts';
  import { textOr } from '../features/content/text.model.ts';
  import EditorialList from '#lib/components/EditorialList.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import LinkList from '#lib/components/LinkList.svelte';
  import {
    emptyActionFor,
    type ListingDestination,
  } from '#lib/features/listings/listing.model.ts';
  import { enabledAttribute } from '#lib/features/listings/presentation.model.ts';

  const {
    page,
    items,
    editorial,
    editorialUI,
    thirdPartyLabel,
    locale,
    destination,
    index = 0,
    update = false,
  }: {
    page: PageRecord;
    items: DisplayLinkRecord[];
    editorial: EditorialRecord[];
    editorialUI: Record<string, string>;
    thirdPartyLabel: string;
    locale: string;
    destination: ListingDestination;
    index?: number;
    update?: boolean;
  } = $props();
</script>

<article
  class="category-card"
  data-category={page.id}
  data-ornament={index % 3}
  data-rail-anchor={enabledAttribute(
    update || [
      'writing',
      'games'
    ].includes(page.id),
  )}
  aria-labelledby="category-{page.id}-title"
>
  <div class="category-summary">
    <div class="category-heading">
      <span class="category-icon" aria-hidden="true">
        <Icon name={textOr(page.icon, 'link')} optical />
      </span>
      <h2 class="category-title" id="category-{page.id}-title">{page.title}</h2>
    </div>
    {#if page.description}
      <div class="category-copy">
        <p class="category-description">{page.description}</p>
      </div>
    {/if}
  </div>
  <div class="category-links">
    {#if items.length}
      <LinkList
        {items}
        ui={editorialUI}
        {thirdPartyLabel}
        {destination}
        sectionID={page.id}
        preview
      />
    {/if}
    {#if !update}
      <EditorialList
        items={editorial}
        ui={editorialUI}
        {thirdPartyLabel}
        sectionID={page.id}
        {locale}
        interfaceName="minecraft"
        {destination}
        emptyAction={emptyActionFor({
          home: true,
          pageURL: page.url,
          homeURL: '',
          sectionID: page.id,
          linksCount: items.length,
          ui: editorialUI,
        })}
        empty={!items.length}
      />
    {/if}
  </div>
</article>
