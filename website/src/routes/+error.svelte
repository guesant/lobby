<script lang="ts">
  import { page } from '$app/state';
  import NotFound from '$lib/NotFound.svelte';
</script>

<NotFound locales={page.data.errorPresentation || []} status={page.status} />
