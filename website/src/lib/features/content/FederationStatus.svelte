<script lang="ts">
  import type { FederationStatus } from '#lib/features/content/federation-status.types.ts';

  const {
    sources,
    labels,
    locale,
  }: {
    sources: FederationStatus[];
    labels: Record<string, string>;
    locale: string;
  } = $props();

  function dateLabel(timestamp: string): string {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    })
      .format(new Date(timestamp));
  }
</script>

{#if sources.length}
  <details class="federation-status">
    <summary>{labels['federation_status']}</summary>
    <ul>
      {#each sources as source (source.id)}
        <li>
          <span>
            {labels[`source_${source.id}`]}: {labels[
              `federation_${source.mode}`
            ]}
          </span>
          <span>
            {labels['last_successful_fetch']}:
            {#if source.lastSuccessfulFetchAt}
              <time datetime={source.lastSuccessfulFetchAt}>
                {dateLabel(source.lastSuccessfulFetchAt)} UTC
              </time>
            {:else}
              {labels['federation_unknown_date']}
            {/if}
          </span>
        </li>
      {/each}
    </ul>
  </details>
{/if}

<style>
  .federation-status {
    padding-block: var(--space-3);
    color: var(--color-text-muted, var(--terminal-muted));
    font-size: var(--font-size-small);
    overflow-wrap: anywhere;
  }
  ul {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-0);
    list-style: none;
  }
  li {
    display: grid;
    gap: var(--space-2);
  }
  summary {
    cursor: pointer;
  }
</style>
