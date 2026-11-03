<script lang="ts">
  import type { PageData } from './$types';
  import SitePage from '#lib/app/SitePage.svelte';
  import MinecraftPage from '#lib/interfaces/minecraft/MinecraftPage.svelte';

  const {
    data,
  }: {
    data: PageData;
  } = $props();
</script>

<SitePage {data}><MinecraftPage {...data} /></SitePage>
