<script lang="ts">
  import '../../../assets/css/not-found.css';
  import { textOr } from '../content/text.model.ts';
  import { initializeErrorPage } from '#lib/browser/error-page.ts';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import type { ErrorLocale } from '#lib/features/navigation/not-found.model.ts';
  import { onMount } from 'svelte';

  const {
    locales,
    status = 404,
  }: {
    locales: ErrorLocale[];
    status?: number;
  } = $props();

  let selected = $state('');

  let terminal = $state(false);

  onMount((): void => {
    const presentation = initializeErrorPage(locales);

    selected = presentation.selected;
    terminal = presentation.terminal;
  });

  function homeURL(locale: ErrorLocale): string {
    if (terminal) {
      return `${locale.home}terminal/`;
    }

    return locale.home;
  }

  function interfaceName(): string {
    if (terminal) {
      return 'terminal';
    }

    if (selected) {
      return 'minecraft';
    }

    return 'neutral';
  }
</script>

<svelte:head>
  <title>{status} | Lobby</title>
  <meta name="robots" content="noindex, follow" />
</svelte:head>

<main class="not-found" data-error-interface={interfaceName()}>
  <p class="not-found-code">{status}</p>
  {#each locales as locale (locale.id)}
    <section
      lang={locale.id}
      hidden={Boolean(selected && selected !== locale.id)}
    >
      {#if status === 404}
        <h1>{locale.title}</h1>
        <p>{locale.description}</p>
      {:else}
        <h1>{locale.errorTitle}</h1>
        <p>{locale.errorDescription}</p>
      {/if}
      <NavigationLink href={homeURL(locale)}>{locale.homeLabel}</NavigationLink>
    </section>
  {/each}
  <nav
    aria-label={textOr(
      locales.find((locale): boolean => {
        return locale.id === selected;
      })?.languagesLabel,
      'Languages',
    )}
  >
    {#each locales as locale (locale.id)}
      <NavigationLink lang={locale.id} href={homeURL(locale)}>
        {locale.name}
      </NavigationLink>
    {/each}
  </nav>
</main>
