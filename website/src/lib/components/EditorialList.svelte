<script lang="ts">
  import { type EditorialRecord } from '../features/content/content.types.ts';
  import { textOr } from '../features/content/text-or.model.ts';
  import ActionRow from '#lib/components/ActionRow.svelte';
  import ContentListHeading from '#lib/components/ContentListHeading.svelte';
  import EditorialEntry from '#lib/components/EditorialEntry.svelte';
  import { editorialListPresentation } from '#lib/features/listings/editorial.viewmodel.ts';
  import {
    type EmptyAction,
    itemHeadingLevel,
    type ListingDestination,
  } from '#lib/features/listings/listing.model.ts';

  const {
    items,
    ui,
    thirdPartyLabel,
    sectionID,
    locale,
    interfaceName,
    destination,
    emptyAction,
    headingLevel = 3,
    empty = false,
  }: {
    items: EditorialRecord[];
    ui: Record<string, string>;
    thirdPartyLabel: string;
    sectionID: string;
    locale: string;
    interfaceName: 'minecraft' | 'terminal';
    destination: ListingDestination;
    emptyAction?: EmptyAction | undefined;
    headingLevel?: 2 | 3 | 4;
    empty?: boolean;
  } = $props();

  const createPresentation = (): ReturnType<
    typeof editorialListPresentation
  > => {
    return editorialListPresentation({
      items,
      sectionID,
      destination,
      emptyAction,
    });
  };

  const presentation = $derived.by(createPresentation);
</script>

{#if items.length}
  <div class="editorial-list" data-editorial-section={sectionID}>
    {#each presentation.groups as group (group.type)}
      <section class="editorial-group" data-editorial-kind={group.type}>
        <ContentListHeading
          label={textOr(ui[group.type], ui[sectionID])}
          level={headingLevel}
        />
        <div class="editorial-group-items divided-list">
          {#each group.items as item (`${item.source}:${item.id}:${item.language}`)}
            <EditorialEntry
              {item}
              {ui}
              {thirdPartyLabel}
              {locale}
              {interfaceName}
              {sectionID}
              {destination}
              headingLevel={itemHeadingLevel(headingLevel)}
            />
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/if}

{#if presentation.missing.length || (empty && !items.length)}
  <div class="editorial-empty-state" data-editorial-empty={sectionID}>
    {#if presentation.missing.length}
      {#each presentation.missing as type (type)}
        <p class="editorial-empty" data-empty-kind={type}>
          {textOr(ui[`empty_${type}`], ui['empty'])}
        </p>
      {/each}
    {:else}
      <p class="editorial-empty">{ui['empty']}</p>
    {/if}
    {#if presentation.fallback && emptyAction}
      <ActionRow
        title={emptyAction.label}
        action={presentation.fallback}
        {thirdPartyLabel}
        {interfaceName}
        className="editorial-related"
      />
    {/if}
  </div>
{/if}
