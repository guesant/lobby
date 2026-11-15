<script lang="ts">
  import type { EditorialRecord } from '../features/content/content.types.ts';
  import { textOr } from '../features/content/text-or.model.ts';
  import ActionRow from '#lib/components/ActionRow.svelte';
  import ActionRowContent from '#lib/components/ActionRowContent.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import { editorialEntryPresentation } from '#lib/features/listings/editorial.viewmodel.ts';
  import type { ListingDestination } from '#lib/features/listings/listing.types.ts';

  const {
    item,
    ui,
    thirdPartyLabel,
    locale,
    sectionID,
    destination,
    headingLevel,
  }: {
    item: EditorialRecord;
    ui: Record<string, string>;
    thirdPartyLabel: string;
    locale: string;
    sectionID: string;
    destination: ListingDestination;
    headingLevel: 3 | 4 | 5;
  } = $props();

  const createPresentation = (): ReturnType<
    typeof editorialEntryPresentation
  > => {
    return editorialEntryPresentation(item, destination, {
      locale,
      languageLabel: ui['language'] ?? '',
    });
  };

  const presentation = $derived.by(createPresentation);

  const hasSecondaryAction = $derived(
    presentation.secondary !== undefined && item.details_label !== undefined,
  );

  const singleAction = $derived(
    (presentation.primary ?? presentation.secondary) !== undefined &&
      !hasSecondaryAction,
  );

  const cardAction = $derived(presentation.primary ?? presentation.secondary);

  const itemAnchor = $derived(`page-${sectionID}-${item.id}`);

  const titleAnchor = $derived(`${itemAnchor}-title`);
</script>

{#snippet entryContent()}
  <header class="editorial-entry-heading">
    <svelte:element this={`h${String(headingLevel)}`} id={titleAnchor}>
      {#if presentation.primary}
        {#if singleAction}
          <ActionRowContent
            title={item.title}
            action={presentation.primary}
            {thirdPartyLabel}
            icon={presentation.icon}
            className="editorial-primary"
          />
        {:else}
          <ActionRow
            title={item.title}
            action={presentation.primary}
            {thirdPartyLabel}
            icon={presentation.icon}
            className="editorial-primary"
          />
        {/if}
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
  {#if hasSecondaryAction && presentation.secondary && item.details_label}
    {#if singleAction}
      <ActionRowContent
        title={item.details_label}
        action={presentation.secondary}
        {thirdPartyLabel}
        className="editorial-details"
      />
    {:else}
      <ActionRow
        title={item.details_label}
        action={presentation.secondary}
        {thirdPartyLabel}
        className="editorial-details"
      />
    {/if}
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
{/snippet}

{#if singleAction && cardAction}
  <NavigationLink
    class="editorial-entry-card-link"
    href={cardAction.href}
    target={cardAction.target}
    rel={cardAction.rel}
    id={itemAnchor}
    lang={item.language}
    aria-labelledby={titleAnchor}
    data-editorial-type={item.type}
    data-editorial-id={item.id}
  >
    <article class="editorial-entry">
      {@render entryContent()}
    </article>
  </NavigationLink>
{:else}
  <article
    class="editorial-entry"
    data-editorial-type={item.type}
    data-editorial-id={item.id}
    id={itemAnchor}
    lang={item.language}
  >
    {@render entryContent()}
  </article>
{/if}
