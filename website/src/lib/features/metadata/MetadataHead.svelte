<script lang="ts">
  import type { PageLoadData } from '../content/content.types.ts';
  import JsonLd from './JsonLd.svelte';
  import { pageMetadata } from './metadata.viewmodel.ts';

  const {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  const getMetadata = (): ReturnType<typeof pageMetadata> => {
    return pageMetadata(data);
  };

  const metadata = $derived.by(getMetadata);
</script>

<svelte:head>
  <title>{metadata.title}</title>
  <meta name="description" content={metadata.description} />
  <meta name="author" content={data.config.profile.name} />
  <meta name="creator" content={data.config.profile.name} />
  <meta name="publisher" content={data.config.profile.name} />
  <meta name="robots" content={metadata.robots} />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="theme-color" content="#111111" />
  <link rel="canonical" href={metadata.canonical} />
  <link rel="icon" href="/favicon.png" type="image/png" sizes="64x64" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link
    rel="manifest"
    href={`/manifests/${data.locale}-${data.interfaceName}.webmanifest`}
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={metadata.title} />
  <meta property="og:description" content={metadata.description} />
  <meta property="og:url" content={metadata.canonical} />
  <meta
    property="og:site_name"
    content={`${data.config.profile.name} | Lobby`}
  />
  <meta property="og:locale" content={data.localized.ui['og_locale']} />
  {#each metadata.ogAlternates as option (option.id)}
    <meta property="og:locale:alternate" content={option.ogLocale} />
  {/each}
  <meta property="og:image" content={metadata.ogImageURL} />
  <meta property="og:image:secure_url" content={metadata.ogImageURL} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={metadata.title} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={metadata.title} />
  <meta name="twitter:description" content={metadata.description} />
  <meta name="twitter:image" content={metadata.ogImageURL} />
  <meta name="twitter:image:alt" content={metadata.title} />
  {#each metadata.alternates as option (option.id)}
    <link rel="alternate" hreflang={option.hreflang} href={option.href} />
  {/each}
  <link
    rel="alternate"
    hreflang="x-default"
    href={metadata.defaultLanguageURL}
  />
</svelte:head>
<JsonLd serialized={metadata.structuredData} />
