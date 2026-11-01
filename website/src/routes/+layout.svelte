<script lang="ts">
  import {
    afterNavigate,
    beforeNavigate,
    goto,
    replaceState,
  } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount, type Snippet } from 'svelte';
  import { languageContext } from '$lib/language-preference.ts';
  import type {
    LanguageContext,
    LanguagePageData,
  } from '$lib/language-preference.ts';
  import {
    createLanguageNavigation,
    type LanguageNavigation,
  } from '$lib/language-navigation.ts';
  import type { PageLoadData } from '$lib/site-data.ts';
  import { on } from 'svelte/events';
  import {
    provideInterfaceState,
    restorePreferences,
  } from '$lib/preferences.svelte.ts';
  import { createPointerSound, type PointerSound } from '$lib/pointer-sound.ts';
  import pointerPress from '../assets/audio/mouse-press.wav';
  import pointerRelease from '../assets/audio/mouse-release.wav';

  const controls = provideInterfaceState();

  let sound = $state.raw<PointerSound>();

  $effect((): void => {
    document.documentElement.dataset.theme = controls.theme;
    document.documentElement.dataset.themeReady = 'true';
    document.documentElement.dataset.linkView = controls.view;
    document.documentElement.dataset.linkViewReady = 'true';
    document.documentElement.dataset.sound = controls.sound;
    document.documentElement.dataset.motion = controls.motion;

    if (controls.reducedMotion) {
      document.documentElement.dataset.motion = 'off';
    }

    sound?.setEnabled(controls.sound === 'on');
  });

  function keydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();

      if (controls.dialog === 'search') {
        controls.dialog = 'none';

        return;
      }

      controls.dialog = 'search';
    }
  }

  function visibility(): void {
    document.documentElement.dataset.pageHidden = String(document.hidden);
  }

  let {
    children,
  }: {
    children: Snippet;
  } = $props();

  type NavigationPageData = LanguagePageData &
    Pick<PageLoadData, 'page' | 'localized'>;

  let data: NavigationPageData | null = $derived.by(
    (): NavigationPageData | null => {
      const {
        config,
        interfaceName,
        isLanguageEntry,
        locale,
        languageRoutes,
        localized,
        page: currentPage,
      } = page.data;

      if (
        page.status >= 400 ||
        !config ||
        !interfaceName ||
        typeof isLanguageEntry !== 'boolean' ||
        !locale ||
        !languageRoutes ||
        !localized ||
        !currentPage
      ) {
        return null;
      }

      return {
        config,
        interfaceName,
        isLanguageEntry,
        locale,
        languageRoutes,
        localized,
        page: currentPage,
      };
    },
  );

  let navigation: LanguageNavigation | undefined;

  onMount((): (() => void) => {
    restorePreferences(controls);
    visibility();
    sound = createPointerSound(
      {
        pointerPress,
        pointerRelease,
      },
      controls.sound === 'on',
    );

    const media = matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotion = (): void => {
      controls.reducedMotion = media.matches;
    };

    updateMotion();

    const stopMedia = on(media, 'change', updateMotion);

    navigation = createLanguageNavigation({
      page: (): {
        context: LanguageContext;
        url: URL;
      } | null => {
        if (!data) {
          return null;
        }

        return {
          context: languageContext(data),
          url: new URL(window.location.href),
        };
      },
      storage: (): Storage => {
        return window.localStorage;
      },
      languages: (): readonly string[] => {
        return (
          navigator.languages || [
            navigator.language,
          ]
        );
      },
      navigate: async (url): Promise<void> => {
        await goto(url, {
          replaceState: true,
          keepFocus: true,
          noScroll: true,
        });

        if (page.status >= 400) {
          throw new Error('Language destination could not be loaded');
        }
      },
      replaceURL: (url): void => {
        replaceState(url, page.state);
      },
      fallback: (url): void => {
        window.location.replace(url.href);
      },
    });

    return (): void => {
      navigation?.destroy();
      sound?.destroy();
      stopMedia();
    };
  });

  const changeLanguage = (event: Event): void => {
    const select = event.target;

    if (
      select instanceof HTMLSelectElement &&
      select.matches('[data-language-switcher]')
    ) {
      const id = select.selectedOptions.item(0)?.dataset.language;

      if (id) {
        void navigation?.select(id);
      }
    }
  };

  beforeNavigate(({
    to
  }): void => {
    navigation?.beforeNavigate(to?.url || null);
  });

  afterNavigate((): void => {
    if (data) {
      document.documentElement.dataset.interface = data.interfaceName;
      document.documentElement.dataset.interfaceReady = 'true';
      document.documentElement.dataset.page = data.page.id;
      document.documentElement.lang = data.localized.ui.html_lang;
      document.body.className = bodyClass(data.interfaceName);
    }

    queueMicrotask((): void => {
      void navigation?.normalize();
    });
  });

  function bodyClass(interfaceName: PageLoadData['interfaceName']): string {
    if (interfaceName === 'terminal') {
      return 'terminal-interface';
    }

    return 'theme-minecraft appearance-system background-default';
  }
</script>

<svelte:document onchange={changeLanguage} onvisibilitychange={visibility} />
<svelte:window
  onkeydown={keydown}
  onstorage={(): void => {
    restorePreferences(controls);
  }}
/>

{@render children()}
