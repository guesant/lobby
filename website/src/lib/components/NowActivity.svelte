<script lang="ts">
  const {
    entries,
    labels,
    className = 'now-activity',
  }: {
    entries: [
      string,
      string,
    ][];
    labels: Record<string, string>;
    className?: string;
  } = $props();
</script>

<dl class={className}>
  {#each entries as [
    key,
    value
  ] (key)}
    <div id="now-activity-{key}">
      <dt>{labels[key]}</dt>
      <dd>{value}</dd>
    </div>
  {/each}
</dl>
