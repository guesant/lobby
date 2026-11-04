<script lang="ts">
  import type { DisplayLinkRecord } from '../features/content/content.types.ts';
  import ActionRow from '#lib/components/ActionRow.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import IconButton from '#lib/components/IconButton.svelte';
  import { linkActionClass } from '#lib/components/link-action-class.model.ts';
  import { previewLinkID } from '#lib/components/preview-link-id.model.ts';
  import type { ListingDestination } from '#lib/features/listings/listing.types.ts';

  const {
    item,
    thirdPartyLabel,
    preview = false,
    destination,
  }: {
    item: DisplayLinkRecord;
    thirdPartyLabel: string;
    preview?: boolean;
    destination: ListingDestination;
  } = $props();

  const createPresentation = (): {
    target: ReturnType<typeof destination>;
    actionClass: string;
    previewID: ReturnType<typeof previewLinkID>;
  } => {
    return {
      target: destination(item),
      actionClass: linkActionClass(preview),
      previewID: previewLinkID(preview, item.id),
    };
  };

  const presentation = $derived.by(createPresentation);
</script>

<article class="link-card">
  <span class="frame-rivet frame-rivet-top-start" aria-hidden="true"></span>
  <span class="frame-rivet frame-rivet-top-end" aria-hidden="true"></span>
  <span class="frame-rivet frame-rivet-bottom-start" aria-hidden="true"></span>
  <span class="frame-rivet frame-rivet-bottom-end" aria-hidden="true"></span>
  <ActionRow
    title={item.title}
    action={presentation.target}
    {thirdPartyLabel}
    interfaceName="voxel"
    icon={item.icon}
    className={presentation.actionClass}
    linkID={item.id}
    previewID={presentation.previewID}
  />
  <div class="link-card-details">
    <span class="link-url">
      <span class="link-url-icon"><Icon name="link" /></span>
      <span class="link-url-text">{presentation.target.display}</span>
    </span>
    {#if item.description}
      <span class="link-description">
        {item.description}
      </span>
    {/if}
    {#if item.badge}
      <span class="link-badge">{item.badge}</span>
    {/if}
    {#if item.visual}
      <span class="link-visual">
        <img
          src={item.visual.src}
          alt={item.visual.alt}
          width={item.visual.width}
          height={item.visual.height}
          loading="lazy"
          decoding="async"
        />
      </span>
    {/if}
    {#if item.stats}
      <div class="statistics" data-statistics={item.id}>
        {#if item.statistics?.metrics}
          <dl class="statistics-grid">
            {#each item.statistics.metrics as metric (metric.id)}
              <div class="statistic statistic-{metric.id}">
                <dt>
                  <IconButton name={metric.icon} optical />
                  <span>{metric.label}</span>
                </dt>
                <dd>
                  {metric.value}
                  {#if metric.total}
                    <span class="statistic-total">
                      / {metric.total}
                    </span>
                  {/if}
                </dd>
              </div>
            {/each}
          </dl>
          <p class="statistics-updated">
            <span>{item.statistics.updatedLabel}</span>
            <time datetime={item.statistics.updatedAt}>
              {item.statistics.updatedAt}
            </time>
          </p>
        {:else}
          <p>{item.statistics?.unavailable}</p>
        {/if}
      </div>
    {/if}
  </div>
</article>
