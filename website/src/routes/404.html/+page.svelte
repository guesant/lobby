<script lang="ts">
  import type { PageData } from './$types';
  import NotFound from '#lib/features/navigation/NotFound.svelte';

  const {
    data,
  }: {
    data: PageData;
  } = $props();
</script>

<NotFound locales={data.errorPresentation} />
