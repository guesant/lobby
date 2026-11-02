<script lang="ts">
  import type { PageLoadData } from '../features/content/content.types.ts';
  import FederationStatus from '../features/content/FederationStatus.svelte';
  import { requiredText } from '../features/content/validation.model.ts';
  import BuildMetadata from './BuildMetadata.svelte';

  const props: {
    data: PageLoadData;
    translationDisclaimer?: string | undefined;
  } = $props();
</script>

<BuildMetadata
  build={props.data.build}
  localCommitLabel={requiredText(
    props.data.localized.ui['local_commit'],
    'local commit label',
  )}
/>
{#if props.translationDisclaimer}
  <p class="translation-disclaimer">{props.translationDisclaimer}</p>
{/if}
<FederationStatus
  sources={props.data.federationStatus}
  labels={props.data.editorialUI}
  locale={props.data.locale}
/>
<p class="brand-disclaimer">{props.data.localized.ui['brand_disclaimer']}</p>
