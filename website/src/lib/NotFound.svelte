<script lang="ts">
  import { onMount } from 'svelte';
  import type { ErrorLocale } from './not-found.ts';
  import { errorAppearance } from './not-found.ts';
  import '../assets/css/not-found.css';

  let {
    locales,
    status = 404,
  }: {
    locales: ErrorLocale[];
    status?: number;
  } = $props();

  let selected = $state('');

  let terminal = $state(false);

  onMount((): void => {
    const parts = window.location.pathname.split('/')
      .filter(Boolean);

    selected =
      locales.find((locale): boolean => {
        return locale.id === parts[0];
      })?.id || '';
    terminal = parts[1] === 'terminal';
    document.body.className = 'error-interface';
    document.documentElement.dataset.interface = 'error';

    try {
      document.documentElement.dataset.errorAppearance = errorAppearance(
        window.localStorage,
      );
    } catch {
      document.documentElement.dataset.errorAppearance = 'system';
    }
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
      <a href={homeURL(locale)}>{locale.homeLabel}</a>
    </section>
  {/each}
  <nav
    aria-label={locales.find((locale): boolean => {
      return locale.id === selected;
    })?.languagesLabel || 'Languages'}
  >
    {#each locales as locale (locale.id)}
      <a lang={locale.id} href={homeURL(locale)}>{locale.name}</a>
    {/each}
  </nav>
</main>
