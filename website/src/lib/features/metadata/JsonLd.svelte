<script lang="ts">
  import { jsonScriptContent } from './serialization.model.ts';

  const {
    serialized,
  }: {
    serialized: string;
  } = $props();

  const createMarkup = (): string => {
    return (
      '<scr' +
      'ipt type="application/ld+json">' +
      jsonScriptContent(serialized) +
      '</scr' +
      'ipt>'
    );
  };

  const markup = $derived.by(createMarkup);
</script>

<svelte:head>
  {@html markup}
</svelte:head>
