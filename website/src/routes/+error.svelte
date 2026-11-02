<script lang="ts">
  import NotFound from '#lib/features/navigation/NotFound.svelte';
  import { page } from '$app/state';
</script>

<NotFound locales={page.data.errorPresentation ?? []} status={page.status} />
