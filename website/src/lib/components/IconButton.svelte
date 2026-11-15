<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';

  const {
    name,
    optical = true,
  }: {
    name: string;
    optical?: boolean;
  } = $props();
</script>

<span class="button-icon" aria-hidden="true"><Icon {name} {optical} /></span>
