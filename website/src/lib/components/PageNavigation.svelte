<script lang="ts">
  import type { PageRecord } from '../features/content/content.types.ts';
  import { sectionMenu } from '#lib/browser/section-menu.ts';
  import IconButton from '#lib/components/IconButton.svelte';
  import { isNavigationPage } from '#lib/components/is-navigation-page.model.ts';
  import { isNowPage } from '#lib/components/is-now-page.model.ts';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import SectionMenuItem from '#lib/components/SectionMenuItem.svelte';
  import { currentPage } from '#lib/features/listings/presentation.model.ts';

  const {
    pages,
    currentID,
    homeURL,
    homeLabel,
    homeIcon,
    label,
    sectionsLabel,
  }: {
    pages: PageRecord[];
    currentID: string;
    homeURL: string;
    homeLabel: string;
    homeIcon: string;
    label: string;
    sectionsLabel: string;
  } = $props();

  const createPageGroups = (): {
    sections: PageRecord[];
    updates: PageRecord[];
  } => {
    return {
      sections: pages.filter(isNavigationPage),
      updates: pages.filter(isNowPage),
    };
  };

  const pageGroups = $derived.by(createPageGroups);
</script>

<nav class="page-navigation" aria-label={label}>
  <NavigationLink
    class="navigation-home"
    href={homeURL}
    aria-current={currentPage(currentID === 'home')}
  >
    <IconButton name={homeIcon} />
    <span class="navigation-home-title">{homeLabel}</span>
  </NavigationLink>
  <span
    class="quick-navigation-divider quick-navigation-divider-start"
    aria-hidden="true"
  ></span>
  <details class="section-switcher" data-section-switcher {@attach sectionMenu}>
    <summary
      class="section-switcher-trigger"
      aria-controls="section-menu"
      aria-label={sectionsLabel}
    >
      <IconButton name="map" />
      <span class="section-switcher-title">{sectionsLabel}</span>
      <span class="navigation-chevron">
        <IconButton name="chevron-right" />
      </span>
    </summary>
    <nav class="section-menu" id="section-menu" aria-label={sectionsLabel}>
      <ul class="section-menu-list">
        {#each pageGroups.sections as entry (entry.id)}
          <li>
            <SectionMenuItem {entry} active={entry.id === currentID} />
          </li>
        {/each}
      </ul>
      <div class="section-menu-updates">
        {#each pageGroups.updates as entry (entry.id)}
          <SectionMenuItem
            {entry}
            active={entry.id === currentID}
            nowShortcut
          />
        {/each}
      </div>
    </nav>
  </details>
</nav>
