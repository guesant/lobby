<script lang="ts">
  import type { PageLoadData } from '../features/content/content.types.ts';
  import Icon from './Icon.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';

  const {
    build,
    localCommitLabel,
  }: {
    build: PageLoadData['build'];
    localCommitLabel: string;
  } = $props();
</script>

<div class="site-footer-meta">
  {#if build.commitLabel === localCommitLabel}
    <span class="site-footer-meta-item site-footer-commit">
      <Icon name="code-commit" optical />
      <span>{build.versionLabel} {build.commitLabel}</span>
    </span>
  {:else}
    <NavigationLink
      class="site-footer-meta-item site-footer-commit"
      href={build.commitURL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon name="code-commit" optical />
      <span>{build.versionLabel} {build.commitLabel}</span>
    </NavigationLink>
  {/if}
  <NavigationLink
    class="site-footer-meta-item site-footer-build"
    href={build.workflowURL}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Icon name="githubactions" optical />
    <span>{build.buildLabel}</span>
  </NavigationLink>
</div>
