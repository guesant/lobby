<script lang="ts">
  import type { EditorialRecord } from '../features/content/content.types.ts';
  import { textOr } from '../features/content/text-or.model.ts';
  import ActionRow from '#lib/components/ActionRow.svelte';
  import { editorialEntryPresentation } from '#lib/features/listings/editorial.viewmodel.ts';
  import type { ListingDestination } from '#lib/features/listings/listing.types.ts';

  const {
    item,
    ui,
    thirdPartyLabel,
    locale,
    interfaceName,
    sectionID,
    destination,
    headingLevel,
  }: {
    item: EditorialRecord;
    ui: Record<string, string>;
    thirdPartyLabel: string;
    locale: string;
    interfaceName: 'voxel' | 'terminal';
    sectionID: string;
    destination: ListingDestination;
    headingLevel: 3 | 4 | 5;
  } = $props();

  const createPresentation = (): ReturnType<
    typeof editorialEntryPresentation
  > => {
    return editorialEntryPresentation(item, destination, {
      locale,
      interfaceName,
      languageLabel: ui['language'] ?? '',
    });
  };

  const presentation = $derived.by(createPresentation);
</script>

<article
  class="editorial-entry"
  data-editorial-type={item.type}
  data-editorial-id={item.id}
  id="page-{sectionID}-{item.id}"
  lang={item.language}
>
  <header class="editorial-entry-heading">
    <svelte:element this={`h${String(headingLevel)}`}>
      {#if presentation.primary}
        <ActionRow
          title={item.title}
          action={presentation.primary}
          {thirdPartyLabel}
          {interfaceName}
          icon={presentation.icon}
          className="editorial-primary"
        />
      {:else}
        <span class="editorial-information">{item.title}</span>
      {/if}
    </svelte:element>
    {#if presentation.origin}
      <span class="editorial-origin">
        {presentation.origin}
      </span>
    {/if}
  </header>
  {#if item.summary}
    <p class="editorial-description">{item.summary}</p>
  {/if}
  {#if presentation.secondary && item.details_label}
    <ActionRow
      title={item.details_label}
      action={presentation.secondary}
      {thirdPartyLabel}
      {interfaceName}
      className="editorial-details"
    />
  {/if}
  {#if item.tags.length}
    <ul class="editorial-tags">
      {#each item.tags as tag (tag)}
        <li>{tag}</li>
      {/each}
    </ul>
  {/if}
  {#if presentation.metadata.length}
    <dl class="editorial-metadata">
      {#each presentation.metadata as metadata (metadata.key)}
        <div>
          <dt>{textOr(ui[metadata.key], metadata.key)}</dt>
          <dd>{metadata.value}</dd>
        </div>
      {/each}
    </dl>
  {/if}
</article>
