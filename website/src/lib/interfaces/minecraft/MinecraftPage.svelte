<script lang="ts">
  import '../../../assets/css/reset.css';
  import '../../../assets/css/main.css';
  import '../../../assets/css/editorial.css';
  import '../../../assets/css/listing.css';
  import '../../../assets/css/bios.css';
  import type { PageLoadData } from '../../features/content/content.types.ts';
  import { navigationOrigin } from '#lib/browser/origin.ts';
  import { progressiveScene } from '#lib/browser/progressive-scene.ts';
  import { suspensionRails } from '#lib/browser/suspension-rails.ts';
  import { tooltip } from '#lib/browser/tooltip.ts';
  import BuildMetadata from '#lib/components/BuildMetadata.svelte';
  import EditorialList from '#lib/components/EditorialList.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import IconButton from '#lib/components/IconButton.svelte';
  import LinkList from '#lib/components/LinkList.svelte';
  import LinkView from '#lib/components/LinkView.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import NavigationLinks from '#lib/components/NavigationLinks.svelte';
  import NowActivity from '#lib/components/NowActivity.svelte';
  import OrnamentLabel from '#lib/components/OrnamentLabel.svelte';
  import SectionCard from '#lib/components/SectionCard.svelte';
  import SuspensionRails from '#lib/components/SuspensionRails.svelte';
  import { reboot } from '#lib/features/boot/reboot.controller.ts';
  import FederationStatus from '#lib/features/content/FederationStatus.svelte';
  import Uptime from '#lib/features/content/Uptime.svelte';
  import { requiredText } from '#lib/features/content/validation.model.ts';
  import { emptyActionFor } from '#lib/features/listings/listing.model.ts';
  import { pagePresentation } from '#lib/features/listings/page.viewmodel.ts';
  import { profileInitials } from '#lib/features/listings/presentation.model.ts';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';

  const state = interfaceState();

  const data: PageLoadData = $props();

  const {
    config,
    editorialUI,
    localized,
    build,
    locale,
    page,
    homeSections,
    quickLinks,
    links,
    editorial,
    now,
  } = $derived(data);

  const home = $derived(page.id === 'home');

  const profile = $derived({
    ...config.profile,
    bio: localized.profile.bio,
    birthDate: config.profile.birth_date,
  });

  const presentation = $derived(pagePresentation(data, navigationOrigin()));

  const nowActivities = $derived(presentation.nowActivities);

  const navigationPages = $derived(presentation.navigationPages);

  const lanternCount = $derived(presentation.lanternCount);

  const destination = $derived(presentation.destination);

  const uiText = $derived(presentation.text);
</script>

<NavigationLink class="skip-link" href="#main-content">
  {localized.ui['skip_link']}
</NavigationLink>
<div class="world-scene" aria-hidden="true" {@attach progressiveScene}>
  <div class="world-landscape"></div>
  <div class="world-landscape-preview"></div>
  <div class="world-clouds"></div>
  <div class="world-dim"></div>
</div>
<div class="site-frame">
  <div class="site-shell">
    <header class="profile">
      <span
        class="frame-ornament frame-ornament-start"
        aria-hidden="true"
      ></span>
      <span class="frame-ornament frame-ornament-end" aria-hidden="true"></span>
      <div class="profile-copy">
        <div class="profile-avatar" aria-hidden="true">
          <span>{profileInitials(profile.name)}</span>
        </div>
        {#if home}
          <h1 class="profile-name">{profile.name}</h1>
        {:else}
          <p class="profile-name">
            {profile.name}
          </p>
        {/if}
        <p class="profile-username">@{profile.username}</p>
        <p class="profile-bio">{profile.bio}</p>
        <p class="profile-uptime">
          <OrnamentLabel as="span" label={uiText('uptime_label')} />
          <Uptime birthDate={profile.birthDate} {locale} />
        </p>
        <nav
          class="profile-navigation"
          aria-labelledby="profile-navigation-title"
        >
          <OrnamentLabel
            id="profile-navigation-title"
            label={uiText('navigation_label')}
          />
          <NavigationLinks
            pages={navigationPages}
            currentID={page.id}
            placement="header"
          />
        </nav>
        <OrnamentLabel
          id="profile-quick-access-title"
          label={uiText('quick_access_title')}
        />
        <div
          class="quick-contacts"
          role="group"
          aria-labelledby="profile-quick-access-title"
        >
          {#each quickLinks as item (item.id)}
            <NavigationLink
              class="quick-contact-link"
              href={destination(item).href}
              target={destination(item).target}
              rel={destination(item).rel}
              title={item.title}
              aria-label={item.title}
            >
              <span class="quick-contact-icon">
                <Icon name={item.icon} optical />
              </span>
              <span class="quick-contact-label">{item.title}</span>
            </NavigationLink>
          {/each}
        </div>
      </div>
    </header>
    <div class="suspended-content" {@attach suspensionRails}>
      <SuspensionRails {lanternCount} />
      <main class="page-content" id="main-content">
        {#if home}
          <section class="presentation-group">
            <header class="section-toolbar">
              <h2 class="section-toolbar-title" id="presentation-title">
                {localized.presentation.title}
              </h2>
            </header>
            <section
              class="presentation home-introduction"
              aria-labelledby="presentation-title"
              data-rail-anchor
            >
              <div class="about-context-grid">
                <ul class="about-facts">
                  {#each localized.presentation.facts as fact (fact.text)}
                    <li class="about-fact">
                      <span class="about-fact-icon">
                        <Icon name={fact.icon} optical />
                      </span>
                      <span>{fact.text}</span>
                    </li>
                  {/each}
                </ul>
                <section class="about-site">
                  <h3 class="about-site-title">
                    <IconButton name="target" />
                    <span>{localized.presentation.site_title}</span>
                  </h3>
                  <ul class="about-topics">
                    {#each localized.presentation.topics as topic (topic)}
                      <li>
                        <span class="about-topic-check">
                          <Icon name="check" optical />
                        </span>
                        <span>{topic}</span>
                      </li>
                    {/each}
                  </ul>
                </section>
              </div>
            </section>
          </section>
          <header class="section-toolbar">
            <h2 class="section-toolbar-title" id="home-categories-title">
              {localized.ui['home_sections_label']}
            </h2>
          </header>
          <LinkView ui={localized.ui} pageKey="sections" />
          <section
            class="home-categories"
            id="home-categories"
            aria-labelledby="home-categories-title"
          >
            <div class="category-grid">
              {#each homeSections as section, index (section.page.id)}
                <SectionCard
                  page={section.page}
                  items={section.links}
                  editorial={section.editorial}
                  {editorialUI}
                  thirdPartyLabel={localized.ui.third_party}
                  {locale}
                  {destination}
                  {index}
                />
              {/each}
            </div>
          </section>
          {#each presentation.nowPages as entry (entry.id)}
            <section class="home-updates" data-home-update="now">
              <SectionCard
                page={entry}
                items={entry.nowLinks}
                editorial={[]}
                {editorialUI}
                thirdPartyLabel={localized.ui.third_party}
                {locale}
                {destination}
                update
              />
              {#if nowActivities.length}
                <article class="now-activity">
                  <NowActivity
                    entries={nowActivities}
                    labels={editorialUI}
                    className=""
                  />
                </article>
              {/if}
            </section>
          {/each}
        {:else if page.id === 'now'}
          <section class="presentation-group page-introduction">
            <header class="section-toolbar">
              <h1 class="section-toolbar-title" id="now-title">{now.title}</h1>
            </header>
            <div
              class="presentation page-introduction-content"
              data-rail-anchor
            >
              <p class="presentation-intro">{now.intro}</p>
            </div>
          </section>
          <article class="presentation" aria-labelledby="now-title">
            <div class="presentation-focus">
              {#each now.sections as section (section.id)}
                <section class="presentation-focus-item" id="now-{section.id}">
                  <span class="presentation-focus-marker"></span>
                  <div class="presentation-focus-copy">
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </div>
                </section>
              {/each}
            </div>
            {#if nowActivities.length}
              <NowActivity entries={nowActivities} labels={editorialUI} />
            {/if}
          </article>
        {:else}
          <section
            class="presentation-group page-introduction"
            aria-labelledby="page-title"
          >
            <header class="section-toolbar">
              <h1 class="section-toolbar-title" id="page-title">
                {page.title}
              </h1>
            </header>
            <div
              class="presentation page-introduction-content"
              data-rail-anchor
            >
              <p class="presentation-intro">{page.description}</p>
            </div>
          </section>
          <section class="link-sections" aria-labelledby="page-title">
            <section class="link-section" id={page.id}>
              <LinkView ui={localized.ui} pageKey={page.id} /><LinkList
                items={links}
                ui={editorialUI}
                thirdPartyLabel={localized.ui.third_party}
                {destination}
                sectionID={page.id}
                headingLevel={2}
              /><EditorialList
                items={editorial}
                ui={editorialUI}
                thirdPartyLabel={localized.ui.third_party}
                sectionID={page.id}
                {locale}
                interfaceName="minecraft"
                {destination}
                headingLevel={2}
                emptyAction={emptyActionFor({
                  home: false,
                  pageURL: page.url,
                  homeURL: `/${locale}/`,
                  sectionID: page.id,
                  linksCount: links.length,
                  ui: editorialUI,
                })}
                empty={!links.length}
              />
            </section>
          </section>
        {/if}
      </main>
    </div>
    <footer class="site-footer">
      <span
        class="frame-ornament frame-ornament-start"
        aria-hidden="true"
      ></span>
      <span class="frame-ornament frame-ornament-end" aria-hidden="true"></span>
      <nav class="footer-navigation" aria-labelledby="footer-navigation-title">
        <OrnamentLabel
          id="footer-navigation-title"
          label={uiText('navigation_label')}
          variant="footer"
        />
        <NavigationLinks
          pages={navigationPages}
          currentID={page.id}
          placement="footer"
        />
      </nav>
      <nav
        class="site-footer-content"
        aria-label={localized.ui['footer_aria_label']}
      >
        <button
          class="site-footer-button icon-control"
          type="button"
          data-search-open
          onclick={(): void => {
            state.dialog = 'search';
          }}
          aria-label={editorialUI['search']}
          data-tooltip
          {@attach tooltip}
        >
          <IconButton name="target" />
        </button>
        <NavigationLink
          class="site-footer-repository icon-control"
          href={`https://github.com/${config.site.repository}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={localized.ui['footer_repository']}
          data-tooltip
          {@attach tooltip}
        >
          <IconButton name="github" />
          <span class="control-tooltip" aria-hidden="true">
            {localized.ui['footer_repository']}
          </span>
        </NavigationLink>
        <button
          class="site-footer-link site-footer-button icon-control"
          type="button"
          aria-label={localized.ui['credits']}
          data-tooltip
          {@attach tooltip}
          data-dialog-open="credits-dialog"
          data-credits-open
          onclick={(): void => {
            state.dialog = 'credits';
          }}
        >
          <IconButton name="scale-balanced" />
          <span class="control-tooltip" aria-hidden="true">
            {localized.ui['credits']}
          </span>
        </button>
        <button
          class="site-footer-link site-footer-button icon-control"
          type="button"
          aria-label={localized.ui['settings_label']}
          data-tooltip
          {@attach tooltip}
          data-dialog-open="settings-dialog"
          data-settings-open
          onclick={(): void => {
            state.dialog = 'settings';
          }}
        >
          <IconButton name="gear" />
          <span class="control-tooltip" aria-hidden="true">
            {localized.ui['settings_label']}
          </span>
        </button>
        <NavigationLink
          class="site-footer-link icon-control"
          data-reboot
          onclick={reboot}
          data-sveltekit-reload
          data-tooltip
          {@attach tooltip}
          href={`${page.url}?lobby-boot=1`}
          aria-label={editorialUI['reboot']}
        >
          <IconButton name="desktop" />
        </NavigationLink>
      </nav>
      <BuildMetadata
        {build}
        localCommitLabel={requiredText(
          localized.ui['local_commit'],
          'local commit label',
        )}
      />
      {#if localized.ui['translation_disclaimer']}
        <p class="translation-disclaimer">
          {localized.ui['translation_disclaimer']}
        </p>
      {/if}
      <FederationStatus
        sources={data.federationStatus}
        labels={editorialUI}
        {locale}
      />
      <p class="brand-disclaimer">{localized.ui['brand_disclaimer']}</p>
    </footer>
  </div>
</div>
