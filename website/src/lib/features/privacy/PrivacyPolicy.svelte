<script lang="ts">
  import type { PageLoadData } from '../content/content.types.ts';
  import NavigationLink from '#lib/components/NavigationLink.svelte';

  const {
    data,
  }: {
    data: PageLoadData;
  } = $props();
</script>

{#if data.privacyPolicy}
  <article class="privacy-policy" aria-labelledby="privacy-policy-title">
    {#if !data.privacyPolicy.analyticsEnabled}
      <p class="privacy-policy-status" role="status">
        {data.privacyPolicy.inactiveNotice}
      </p>
    {/if}
    {#each data.privacyPolicy.sections as section (section.title)}
      <section class="privacy-policy-section">
        <h2>{section.title}</h2>
        {#each section.paragraphs as paragraph (paragraph)}
          <p>{paragraph}</p>
        {/each}
      </section>
    {/each}
    <section class="privacy-policy-section">
      <h2>{data.privacyPolicy.referencesLabel}</h2>
      <ul>
        {#each data.privacyPolicy.references as reference (reference.url)}
          <li>
            <NavigationLink
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {reference.label}
            </NavigationLink>
          </li>
        {/each}
      </ul>
    </section>
    <NavigationLink
      class="privacy-policy-contact"
      href={data.privacyPolicy.contactURL}
    >
      {data.privacyPolicy.contactLabel}
    </NavigationLink>
  </article>
{/if}
