<script lang="ts">
  import type { LinkDestination } from '../features/content/content.types.ts';
  import ActionRowContent from '#lib/components/ActionRowContent.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';

  const {
    title,
    action,
    thirdPartyLabel,
    icon,
    className = '',
    linkID,
    previewID,
  }: {
    title: string;
    action: LinkDestination;
    thirdPartyLabel: string;
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
    Boolean(icon) && 'action-row-with-icon'
  ]}
  href={action.href}
  target={action.target}
  rel={action.rel}
  data-link-id={linkID}
  data-preview-id={previewID}
>
  <ActionRowContent {title} {action} {thirdPartyLabel} {icon} wrapped={false} />
</NavigationLink>
