<script lang="ts">
  import type { LinkDestination } from '../features/content/content.types.ts';
  import Icon from '#lib/components/Icon.svelte';

  const {
    title,
    action,
    thirdPartyLabel,
    icon,
    className = '',
    wrapped = true,
  }: {
    title: string;
    action: LinkDestination;
    thirdPartyLabel: string;
    icon?: string | undefined;
    className?: string;
    wrapped?: boolean;
  } = $props();
</script>

{#snippet rowContent()}
  {#if icon}
    <span class="action-row-icon link-icon" aria-hidden="true">
      <Icon name={icon} optical />
    </span>
  {/if}
  <span class="action-row-title link-title">{title}</span>
  <span class="action-row-indicators">
    {#if action.thirdParty}
      <span class="link-third-party-badge">
        {thirdPartyLabel}
      </span>
    {/if}
    {#if action.external}
      <span class="external-link-icon" aria-hidden="true">
        <Icon name="external-link" />
      </span>
    {/if}
  </span>
{/snippet}

{#if wrapped}
  <span
    class={[
      'action-row',
      className,
      Boolean(icon) && 'action-row-with-icon'
    ]}
  >
    {@render rowContent()}
  </span>
{:else}
  {@render rowContent()}
{/if}
