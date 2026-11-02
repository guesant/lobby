<script lang="ts">
  import type { PageLoadData } from '../features/content/content.types.ts';
  import NavigationLink from '#lib/components/NavigationLink.svelte';

  const {
    build,
    localCommitLabel,
  }: {
    build: PageLoadData['build'];
    localCommitLabel: string;
  } = $props();
</script>

<p class="site-footer-meta">
  {#if build.commitLabel === localCommitLabel}
    <span class="site-footer-commit">
      {build.versionLabel}
      {build.commitLabel}
    </span>
  {:else}
    <NavigationLink
      class="site-footer-commit"
      href={build.commitURL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {build.versionLabel}
      {build.commitLabel}
    </NavigationLink>
  {/if}
  <span class="footer-meta-separator" aria-hidden="true">·</span>
  <NavigationLink
    class="site-footer-build"
    href={build.workflowURL}
    target="_blank"
    rel="noopener noreferrer"
  >
    {build.buildLabel}
  </NavigationLink>
</p>
