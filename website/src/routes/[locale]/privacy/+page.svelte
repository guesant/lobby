<script lang="ts">
  import type { PageData } from './$types';
  import SitePage from '#lib/app/SitePage.svelte';
  import VoxelPage from '#lib/interfaces/voxel/VoxelPage.svelte';

  const {
    data,
  }: {
    data: PageData;
  } = $props();
</script>

<SitePage {data}><VoxelPage {...data} /></SitePage>
