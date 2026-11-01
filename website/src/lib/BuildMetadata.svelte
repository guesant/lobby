<script lang="ts">
  import type { PageLoadData } from './site-data.ts';

  let {
    build,
    localCommitLabel,
  }: {
    build: PageLoadData['build'];
    localCommitLabel: string;
  } = $props();
</script>

<p class="site-footer-meta">
  {#if build.commitLabel === localCommitLabel}<span class="site-footer-commit">
    {build.versionLabel}
    {build.commitLabel}
  </span>{:else}<a
    class="site-footer-commit"
    href={build.commitURL}
    target="_blank"
    rel="noopener noreferrer"
  >
    {build.versionLabel}
    {build.commitLabel}
  </a>{/if}
  <span class="footer-meta-separator" aria-hidden="true">·</span>
  <a
    class="site-footer-build"
    href={build.workflowURL}
    target="_blank"
    rel="noopener noreferrer"
  >
    {build.buildLabel}
  </a>
</p>
