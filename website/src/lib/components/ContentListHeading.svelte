<script lang="ts">
  import { requiredText } from '#lib/features/content/validation.model.ts';

  const {
    label,
    level = 3,
  }: {
    label: string | undefined;
    level?: 2 | 3 | 4;
  } = $props();

  const title = $derived(requiredText(label, 'listing.heading'));
</script>

<header class="content-list-heading">
  <svelte:element this={`h${String(level)}`}>{title}</svelte:element>
</header>
