<script lang="ts">
  import { jsonScriptContent } from './serialization.model.ts';

  const {
    serialized,
  }: {
    serialized: string;
  } = $props();

  const markup = $derived(
    '<scr' +
      'ipt type="application/ld+json">' +
      jsonScriptContent(serialized) +
      '</scr' +
      'ipt>',
  );
</script>

<svelte:head>
  {@html markup}
</svelte:head>
