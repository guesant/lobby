<script lang="ts">
  import BiosScreen from '$lib/BiosScreen.svelte';
  import IconButton from '$lib/IconButton.svelte';
  import type { Snippet } from 'svelte';
  import { siteOrigin } from '$lib/site-origin.ts';
  import type { PageLoadData } from '$lib/site-data.ts';
  import { goto } from '$app/navigation';
  import { interfaceState, setPreference } from '$lib/preferences.svelte.ts';
  import { dialogBackdrop, showDialog } from '$lib/dialog.ts';
  import SearchDialog from '$lib/SearchDialog.svelte';
  import { interfaceDestination } from '$lib/interface-navigation.ts';

  const ogImageURL = `${siteOrigin}/images/og-image.png`;

  const controls = interfaceState();

  let settingsDialog = $state<HTMLDialogElement>();

  let creditsDialog = $state<HTMLDialogElement>();

  $effect((): void => {
    showDialog(settingsDialog, controls.dialog === 'settings');
    showDialog(creditsDialog, controls.dialog === 'credits');
  });

  async function changeInterface(event: Event): Promise<void> {
    if (!(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }

    const selected = event.currentTarget.value;

    if (selected === data.interfaceName) {
      return;
    }

    let path = data.standardPageURL;

    if (selected === 'terminal') {
      path = data.terminalPageURL;
    }

    const target = interfaceDestination(
      new URL(window.location.href),
      path,
      selected === 'terminal',
    );

    controls.dialog = 'none';
    await goto(target, {
      keepFocus: true,
    });
  }

  let {
    data,
    children,
  }: {
    data: PageLoadData;
    children: Snippet;
  } = $props();

  let terminal = $derived(data.interfaceName === 'terminal');

  let {
    config,
    editorialUI,
    localized,
    locale,
    page,
    languageRoutes,
    standardHomeURL,
  } = $derived(data);

  let home = $derived(page.id === 'home');

  let credits = $derived(data.credits.entries);

  let title = $derived.by((): string => {
    if (home) {
      return localized.seo.title;
    }

    if (page.id === 'now') {
      return data.now.seo.title;
    }

    return `${page.title} | ${config.profile.name}`;
  });

  let description = $derived.by((): string => {
    if (home) {
      return localized.seo.description;
    }

    if (page.id === 'now') {
      return data.now.seo.description;
    }

    return page.description || localized.seo.description;
  });

  let canonical = $derived(`${siteOrigin}${page.url}`);

  let siteCanonical = $derived(`${siteOrigin}/${locale}/`);

  let alternateRoutes = $derived(
    languageRoutes.filter((option): boolean => {
      return option.available;
    }),
  );

  let defaultRoute = $derived(
    alternateRoutes.find((option): boolean => {
      return option.id === config.language_preference.default;
    }) ||
      alternateRoutes.find((option): boolean => {
        return option.id === 'en';
      }) ||
      alternateRoutes[0],
  );

  const robots = $derived.by((): 'noindex, follow' | 'index, follow' => {
    if (data.isLanguageEntry) {
      return 'noindex, follow';
    }

    return 'index, follow';
  });

  const defaultLanguageURL = $derived.by((): string => {
    if (terminal) {
      return defaultRoute?.terminalURL || standardHomeURL;
    }

    return defaultRoute?.standardURL || standardHomeURL;
  });

  function languageURL(option: PageLoadData['languageRoutes'][number]): string {
    if (terminal) {
      return option.terminalURL;
    }

    return option.standardURL;
  }

  function themeLabel(theme: string): string {
    if (theme === 'system') {
      return localized.ui.theme_system || '';
    }

    if (theme === 'dark') {
      return localized.ui.theme_dark || '';
    }

    return localized.ui.theme_light || '';
  }

  function pageIdentity(): Record<
    string,
    | string
    | {
      '@id': string;
    }
  > {
    if (home) {
      return {
        '@type': 'ProfilePage',
        '@id': `${canonical}#profile`,
        mainEntity: {
          '@id': `${siteOrigin}/#person`,
        },
      };
    }

    return {
      '@type': 'WebPage',
      '@id': `${canonical}#page`,
      about: {
        '@id': `${siteOrigin}/#person`,
      },
    };
  }

  let structuredData = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': `${siteOrigin}/#person`,
          name: config.profile.name,
          alternateName: `@${config.profile.username}`,
          url: siteOrigin,
          image: ogImageURL,
          sameAs: data.quickLinks
            .filter((item): boolean => {
              return config.profile.same_as_links.includes(item.id);
            })
            .map((item): string => {
              return item.url;
            }),
        },
        {
          '@type': 'WebSite',
          '@id': `${siteCanonical}#website`,
          url: siteCanonical,
          name: localized.seo.title,
          description: localized.seo.description,
          inLanguage: localized.ui.html_lang,
          publisher: {
            '@id': `${siteOrigin}/#person`,
          },
        },
        {
          ...pageIdentity(),
          url: canonical,
          name: title,
          description,
          inLanguage: localized.ui.html_lang,
          isPartOf: {
            '@id': `${siteCanonical}#website`,
          },
        },
      ],
    })
      .replaceAll('<', '\\u003c'),
  );

  let structuredDataMarkup = $derived(
    '<scr' +
      'ipt type="application/ld+json">' +
      structuredData +
      '</scr' +
      'ipt>',
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="author" content={config.profile.name} />
  <meta name="creator" content={config.profile.name} />
  <meta name="publisher" content={config.profile.name} />
  <meta name="robots" content={robots} />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="theme-color" content="#111111" />
  <link rel="canonical" href={canonical} />
  <link rel="icon" href="/favicon.png" type="image/png" sizes="64x64" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link
    rel="manifest"
    href={`/manifests/${locale}-${data.interfaceName}.webmanifest`}
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:site_name" content={`${config.profile.name} | Lobby`} />
  <meta property="og:locale" content={localized.ui.og_locale} />
  {#each alternateRoutes.filter((option): boolean => {
    return option.id !== locale;
  }) as option}
    <meta property="og:locale:alternate" content={option.ogLocale} />
  {/each}
  <meta property="og:image" content={ogImageURL} />
  <meta property="og:image:secure_url" content={ogImageURL} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={title} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImageURL} />
  <meta name="twitter:image:alt" content={title} />
  {#each alternateRoutes as option}
    <link
      rel="alternate"
      hreflang={option.hreflang}
      href={`${siteOrigin}${languageURL(option)}`}
    />
  {/each}
  <link
    rel="alternate"
    hreflang="x-default"
    href={`${siteOrigin}${defaultLanguageURL}`}
  />
  {@html structuredDataMarkup}
</svelte:head>

{@render children()}

<dialog
  bind:this={settingsDialog}
  onclick={dialogBackdrop}
  onclose={(): void => {
    if (!settingsDialog?.open && controls.dialog === 'settings') {
      controls.dialog = 'none';
    }
  }}
  class="app-dialog settings-dialog"
  id="settings-dialog"
  aria-labelledby="settings-dialog-title"
>
  <div class="app-dialog-content settings-content">
    <header class="app-dialog-header">
      <h2 id="settings-dialog-title">
        <IconButton name="gear" />
        <span>{localized.ui.settings_label}</span>
      </h2>
      <form method="dialog">
        <button
          class="dialog-close"
          type="submit"
          data-dialog-close
          aria-label={localized.ui.settings_close}
        >
          <IconButton name="xmark" />
        </button>
      </form>
    </header>
    <div class="site-controls">
      <div class="toggle-control sound-control">
        <span class="toggle-label" id="sound-label">{editorialUI.sound}</span>
        <div
          class="toggle-group"
          role="radiogroup"
          aria-labelledby="sound-label"
        >
          <input
            class="toggle-input"
            type="radio"
            name="sound"
            id="sound-on"
            value="on"
            data-sound-option
            checked={controls.sound === 'on'}
            onchange={(event): void => {
              setPreference(controls, 'sound', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="sound-on">
            {editorialUI.sound_on}
          </label>
          <input
            class="toggle-input"
            type="radio"
            name="sound"
            id="sound-off"
            value="off"
            data-sound-option
            checked={controls.sound === 'off'}
            onchange={(event): void => {
              setPreference(controls, 'sound', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="sound-off">
            {editorialUI.sound_off}
          </label>
        </div>
      </div>
      <div class="toggle-control interface-control">
        <span class="toggle-label" id="interface-label">
          {editorialUI.interface}
        </span>
        <div
          class="toggle-group"
          role="radiogroup"
          aria-labelledby="interface-label"
        >
          <input
            class="toggle-input"
            type="radio"
            name="interface"
            id="interface-minecraft"
            value="minecraft"
            data-interface-option
            data-interface-url={data.standardPageURL}
            checked={!terminal}
            onchange={(event): void => {
              void changeInterface(event);
            }}
          />
          <label class="toggle-button" for="interface-minecraft">
            Minecraft
          </label>
          <input
            class="toggle-input"
            type="radio"
            name="interface"
            id="interface-terminal"
            value="terminal"
            data-interface-option
            data-interface-url={data.terminalPageURL}
            checked={terminal}
            onchange={(event): void => {
              void changeInterface(event);
            }}
          />
          <label class="toggle-button" for="interface-terminal">Terminal</label>
        </div>
      </div>
      <div class="toggle-control language-control">
        <span class="toggle-label" id="language-label">
          <IconButton name="language" />
          <span>{localized.ui.language_aria_label}</span>
        </span>
        <div class="language-select-wrap">
          <select
            class="language-select"
            aria-labelledby="language-label"
            data-language-switcher
          >
            {#each languageRoutes as option}<option
              value={languageURL(option)}
              data-language={option.id}
              selected={option.id === locale}
            >
              {option.label}
            </option>{/each}
          </select>
          <span class="language-select-icon">
            <IconButton name="chevron-right" />
          </span>
        </div>
      </div>
      <div class="toggle-control">
        <span class="toggle-label" id="theme-label">
          {localized.ui.theme_label}
        </span>
        <div
          class="toggle-group"
          role="radiogroup"
          aria-labelledby="theme-label"
        >
          {#each [
            'system',
            'dark',
            'light'
          ] as theme}<input
            class="toggle-input"
            type="radio"
            name="theme"
            id="theme-{theme}"
            value={theme}
            data-theme-option
            checked={theme === controls.theme}
            onchange={(event): void => {
              setPreference(controls, 'theme', event.currentTarget.value);
            }}
          />
            <label class="toggle-button" for="theme-{theme}">
              {themeLabel(theme)}
            </label>{/each}
        </div>
      </div>
      <div class="toggle-control motion-control">
        <span class="toggle-label" id="motion-label">
          {localized.ui.animations_label}
        </span>
        <div
          class="toggle-group toggle-group-motion"
          role="radiogroup"
          aria-labelledby="motion-label"
        >
          <input
            class="toggle-input"
            type="radio"
            name="motion"
            id="motion-on"
            value="on"
            data-motion-option
            checked={controls.motion === 'on'}
            onchange={(event): void => {
              setPreference(controls, 'motion', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="motion-on">
            {localized.ui.animations_enabled}
          </label>
          <input
            class="toggle-input"
            type="radio"
            name="motion"
            id="motion-off"
            value="off"
            data-motion-option
            checked={controls.motion === 'off'}
            onchange={(event): void => {
              setPreference(controls, 'motion', event.currentTarget.value);
            }}
          />
          <label class="toggle-button" for="motion-off">
            {localized.ui.animations_disabled}
          </label>
        </div>
      </div>
    </div>
  </div>
</dialog>

{#key `${locale}:${terminal}`}
  <SearchDialog {data} />
{/key}

<dialog
  class="app-dialog credits-dialog"
  bind:this={creditsDialog}
  onclick={dialogBackdrop}
  onclose={(): void => {
    if (!creditsDialog?.open && controls.dialog === 'credits') {
      controls.dialog = 'none';
    }
  }}
  id="credits-dialog"
  data-credits-dialog
  aria-labelledby="credits-dialog-title"
  aria-describedby="credits-dialog-description"
>
  <div class="app-dialog-content credits-dialog-content">
    <header class="app-dialog-header credits-dialog-header">
      <div class="credits-dialog-heading">
        <h2 id="credits-dialog-title">{localized.ui.credits_dialog_title}</h2>
        <p id="credits-dialog-description">
          {localized.ui.credits_dialog_description}
        </p>
      </div>
      <form method="dialog">
        <button
          class="dialog-close"
          type="submit"
          data-dialog-close
          aria-label={localized.ui.credits_close}
        >
          <IconButton name="xmark" />
        </button>
      </form>
    </header>
    <div class="credits-list">
      {#each credits as credit}<section
        class="credit-entry"
        aria-labelledby="credit-{credit.id}-title"
      >
        <h3 id="credit-{credit.id}-title">{credit.name}</h3>
        <dl class="credit-entry-meta">
          <div>
            <dt>{localized.ui.credits_authors}</dt>
            <dd>{credit.authors}</dd>
          </div>
          <div>
            <dt>{localized.ui.credits_license}</dt>
            <dd>
              <a
                class="credit-license-link"
                href={data.credits.licenses[credit.license]?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.credits.licenses[credit.license]?.name ||
                  credit.license}
              </a>
            </dd>
          </div>
        </dl>
        <details class="credit-license">
          <summary>{localized.ui.credits_license_text}</summary>
          <pre>{data.credits.licenses[credit.license]?.text || ''}</pre>
        </details>
        <a
          class="credit-official-link"
          href={credit.official_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {localized.ui.credits_official_url}
        </a>
      </section>{/each}
    </div>
  </div>
</dialog>

<BiosScreen ui={editorialUI} />
