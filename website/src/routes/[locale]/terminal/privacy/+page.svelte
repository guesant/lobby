<script lang="ts">
  import type { PageData } from './$types';
  import SitePage from '#lib/app/SitePage.svelte';
  import TerminalPage from '#lib/interfaces/terminal/TerminalPage.svelte';

  const {
    data,
  }: {
    data: PageData;
  } = $props();
</script>

<SitePage {data}><TerminalPage {...data} /></SitePage>
