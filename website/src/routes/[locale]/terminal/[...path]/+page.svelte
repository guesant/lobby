<script lang="ts">
  import SitePage from '$lib/SitePage.svelte';
  import TerminalPage from '$lib/TerminalPage.svelte';
  import type { PageData } from './$types';

  let {
    data,
  }: {
    data: PageData;
  } = $props();
</script>

<SitePage {data}><TerminalPage {data} /></SitePage>
