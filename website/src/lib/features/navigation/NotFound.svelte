<script lang="ts">
  import '../../../assets/css/not-found.css';
  import { textOr } from '../content/text-or.model.ts';
  import { errorHomeURL } from './error-home-url.viewmodel.ts';
  import { errorInterfaceName } from './error-interface-name.viewmodel.ts';
  import { selectedErrorLocale } from './selected-error-locale.viewmodel.ts';
  import { syncErrorPage } from './sync-error-page.ts';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import type { ErrorLocale } from '#lib/features/navigation/not-found.model.ts';

  const {
    locales,
    status = 404,
  }: {
    locales: ErrorLocale[];
    status?: number;
  } = $props();

  const state = $state({
    selected: '',
    terminal: false,
  });

  const getLanguagesLabel = (): string => {
    const selectedLocale = selectedErrorLocale(locales, state.selected);

    return textOr(selectedLocale?.languagesLabel, 'Languages');
  };

  const languagesLabel = $derived.by(getLanguagesLabel);
</script>

<svelte:head>
  <title>{status} | Lobby</title>
  <meta name="robots" content="noindex, follow" />
</svelte:head>

<main
  class="not-found"
  data-error-interface={errorInterfaceName(state)}
  use:syncErrorPage={{
    locales,
    state,
  }}
>
  <p class="not-found-code">{status}</p>
  {#each locales as locale (locale.id)}
    <section
      lang={locale.id}
      hidden={Boolean(state.selected && state.selected !== locale.id)}
    >
      {#if status === 404}
        <h1>{locale.title}</h1>
        <p>{locale.description}</p>
      {:else}
        <h1>{locale.errorTitle}</h1>
        <p>{locale.errorDescription}</p>
      {/if}
      <NavigationLink href={errorHomeURL(locale, state.terminal)}>
        {locale.homeLabel}
      </NavigationLink>
    </section>
  {/each}
  <nav aria-label={languagesLabel}>
    {#each locales as locale (locale.id)}
      <NavigationLink
        lang={locale.id}
        href={errorHomeURL(locale, state.terminal)}
      >
        {locale.name}
      </NavigationLink>
    {/each}
  </nav>
</main>
