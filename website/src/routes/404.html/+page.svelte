<script lang="ts">
  import NotFound from '$lib/NotFound.svelte';
  import type { PageData } from './$types';

  let {
    data,
  }: {
    data: PageData;
  } = $props();
</script>

<NotFound locales={data.errorPresentation} />
