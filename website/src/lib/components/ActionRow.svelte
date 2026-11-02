<script lang="ts">
  import type { LinkDestination } from '../features/content/content.types.ts';
  import Icon from '#lib/components/Icon.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';

  const {
    title,
    action,
    thirdPartyLabel,
    interfaceName,
    icon,
    className = '',
    linkID,
    previewID,
  }: {
    title: string;
    action: LinkDestination;
    thirdPartyLabel: string;
    interfaceName: 'minecraft' | 'terminal';
    icon?: string | undefined;
    className?: string;
    linkID?: string;
    previewID?: string | undefined;
  } = $props();
</script>

<NavigationLink
  class={[
    'action-row',
    className,
    Boolean(icon) && interfaceName === 'minecraft' && 'action-row-with-icon',
  ]}
  href={action.href}
  target={action.target}
  rel={action.rel}
  data-link-id={linkID}
  data-preview-id={previewID}
>
  {#if icon && interfaceName === 'minecraft'}
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
        {#if interfaceName === 'terminal'}
          ↗
        {:else}
          <Icon name="external-link" />
        {/if}
      </span>
    {/if}
  </span>
</NavigationLink>
