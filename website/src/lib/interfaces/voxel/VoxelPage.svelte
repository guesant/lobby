<script lang="ts">
  import '../../../assets/css/reset.css';
  import '../../../assets/css/main.css';
  import '../../../assets/css/editorial.css';
  import '../../../assets/css/listing.css';
  import type { PageLoadData } from '../../features/content/content.types.ts';
  import { navigationOrigin } from '#lib/browser/origin.ts';
  import { progressiveScene } from '#lib/browser/progressive-scene.ts';
  import { suspensionRails } from '#lib/browser/suspension-rails.ts';
  import { tooltip } from '#lib/browser/tooltip.ts';
  import EditorialList from '#lib/components/EditorialList.svelte';
  import FooterMetadata from '#lib/components/FooterMetadata.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import IconButton from '#lib/components/IconButton.svelte';
  import LinkList from '#lib/components/LinkList.svelte';
  import LinkView from '#lib/components/LinkView.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import NavigationLinks from '#lib/components/NavigationLinks.svelte';
  import NowActivity from '#lib/components/NowActivity.svelte';
  import OrnamentLabel from '#lib/components/OrnamentLabel.svelte';
  import PageIntroduction from '#lib/components/PageIntroduction.svelte';
  import SectionCard from '#lib/components/SectionCard.svelte';
  import SuspensionRails from '#lib/components/SuspensionRails.svelte';
  import { reboot } from '#lib/features/boot/reboot.controller.ts';
  import Uptime from '#lib/features/content/Uptime.svelte';
  import { requiredText } from '#lib/features/content/validation.model.ts';
  import { emptyActionFor } from '#lib/features/listings/listing.model.ts';
  import { pagePresentation } from '#lib/features/listings/page.viewmodel.ts';
  import { profileInitials } from '#lib/features/listings/presentation.model.ts';
  import { openDialog } from '#lib/features/preferences/open-dialog.controller.ts';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';

  const state = interfaceState();

  const data: PageLoadData = $props();

  const home = $derived(data.page.id === 'home');

  const profile = $derived({
    ...data.config.profile,
    bio: data.localized.profile.bio,
    birthDate: data.config.profile.birth_date,
  });

  const createPresentation = (): ReturnType<typeof pagePresentation> => {
    const origin = navigationOrigin();

    return pagePresentation(data, origin);
  };

  const presentation = $derived.by(createPresentation);

  const nowActivities = $derived(presentation.nowActivities);

  const navigationPages = $derived(presentation.navigationPages);

  const lanternCount = $derived(presentation.lanternCount);

  const destination = $derived(presentation.destination);
</script>

<NavigationLink class="skip-link" href="#main-content">
  {data.localized.ui['skip_link']}
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
          <OrnamentLabel
            as="span"
            label={requiredText(
              data.localized.ui['uptime_label'],
              `locales.$locale={data.locale}.ui.uptime_label`,
            )}
          />
          <Uptime birthDate={profile.birthDate} locale={data.locale} />
        </p>
        <nav
          class="profile-navigation"
          aria-labelledby="profile-navigation-title"
        >
          <OrnamentLabel
            id="profile-navigation-title"
            label={requiredText(
              data.localized.ui['navigation_label'],
              `locales.$locale={data.locale}.ui.navigation_label`,
            )}
          />
          <NavigationLinks
            pages={navigationPages}
            currentID={data.page.id}
            placement="header"
          />
        </nav>
        <OrnamentLabel
          id="profile-quick-access-title"
          label={requiredText(
            data.localized.ui['quick_access_title'],
            `locales.$locale={data.locale}.ui.quick_access_title`,
          )}
        />
        <div
          class="quick-contacts"
          role="group"
          aria-labelledby="profile-quick-access-title"
        >
          {#each data.quickLinks as item (item.id)}
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
          <section class="presentation-group home-context-group">
            <header class="section-toolbar">
              <h2 class="section-toolbar-title" id="presentation-title">
                {data.localized.presentation.title}
              </h2>
            </header>
            <section
              class="presentation home-introduction"
              aria-labelledby="presentation-title"
              data-rail-anchor
            >
              <div class="about-context-grid">
                <ul class="about-facts">
                  {#each data.localized.presentation.facts as fact (fact.text)}
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
                    <span>{data.localized.presentation.site_title}</span>
                  </h3>
                  <ul class="about-topics">
                    {#each data.localized.presentation.topics as topic (topic)}
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
          <div class="presentation-group home-explore-group">
            <header class="section-toolbar home-sections-toolbar">
              <h2 class="section-toolbar-title" id="home-categories-title">
                {data.localized.ui['home_sections_label']}
              </h2>
            </header>
            <div class="home-listings">
              <LinkView ui={data.localized.ui} />
              <section
                class="home-categories"
                id="home-categories"
                aria-labelledby="home-categories-title"
              >
                <div class="category-grid">
                  {#each data.homeSections as section, index (section.page.id)}
                    <SectionCard
                      page={section.page}
                      items={section.links}
                      editorial={section.editorial}
                      editorialUI={data.editorialUI}
                      thirdPartyLabel={data.localized.ui.third_party}
                      detailed={state.view === 'detailed'}
                      locale={data.locale}
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
                    editorialUI={data.editorialUI}
                    thirdPartyLabel={data.localized.ui.third_party}
                    detailed={state.view === 'detailed'}
                    locale={data.locale}
                    {destination}
                    update
                  />
                  {#if nowActivities.length}
                    <article class="now-activity">
                      <NowActivity
                        entries={nowActivities}
                        labels={data.editorialUI}
                        className=""
                      />
                    </article>
                  {/if}
                </section>
              {/each}
            </div>
          </div>
        {:else if data.page.id === 'now'}
          <section class="presentation-group page-introduction">
            <header class="section-toolbar">
              <h1 class="section-toolbar-title" id="now-title">
                {data.now.title}
              </h1>
            </header>
            <div
              class="presentation page-introduction-content"
              data-rail-anchor
            >
              <p class="presentation-intro">{data.now.intro}</p>
            </div>
          </section>
          <article class="presentation" aria-labelledby="now-title">
            <div class="presentation-focus">
              {#each data.now.sections as section (section.id)}
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
              <NowActivity entries={nowActivities} labels={data.editorialUI} />
            {/if}
          </article>
        {:else if data.page.type === 'privacy-page'}
          <PageIntroduction
            title={data.page.title}
            description={data.page.description}
            titleID="privacy-policy-title"
          />
          {#await import('../../features/privacy/PrivacyPolicy.svelte') then {
            default: PrivacyPolicy
          }}
            <div class="presentation privacy-policy-panel">
              <PrivacyPolicy {data} />
            </div>
          {/await}
        {:else}
          <PageIntroduction
            title={data.page.title}
            description={data.page.description}
            titleID="page-title"
          />
          <section class="link-sections" aria-labelledby="page-title">
            <section class="link-section" id={data.page.id}>
              <LinkView ui={data.localized.ui} /><LinkList
                items={data.links}
                ui={data.editorialUI}
                thirdPartyLabel={data.localized.ui.third_party}
                detailed={state.view === 'detailed'}
                {destination}
                sectionID={data.page.id}
                headingLevel={2}
              /><EditorialList
                items={data.editorial}
                ui={data.editorialUI}
                thirdPartyLabel={data.localized.ui.third_party}
                sectionID={data.page.id}
                locale={data.locale}
                {destination}
                headingLevel={2}
                emptyAction={emptyActionFor({
                  home: false,
                  pageURL: data.page.url,
                  homeURL: `/${data.locale}/`,
                  sectionID: data.page.id,
                  linksCount: data.links.length,
                  ui: data.editorialUI,
                })}
                empty={!data.links.length}
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
          label={requiredText(
            data.localized.ui['navigation_label'],
            `locales.$locale={data.locale}.ui.navigation_label`,
          )}
          variant="footer"
        />
        <NavigationLinks
          pages={navigationPages}
          currentID={data.page.id}
          placement="footer"
        />
        <ul class="navigation-links footer-navigation-links">
          <li>
            <NavigationLink class="footer-privacy-link" href={data.privacyURL}>
              {data.localized.ui['privacy_policy']}
            </NavigationLink>
          </li>
        </ul>
      </nav>
      <nav
        class="site-footer-content"
        aria-label={data.localized.ui['footer_aria_label']}
      >
        <button
          class="site-footer-button icon-control"
          type="button"
          data-search-open
          onclick={openDialog.bind(null, state, 'search')}
          aria-label={data.editorialUI['search']}
          data-tooltip
          {@attach tooltip}
        >
          <IconButton name="target" />
        </button>
        <NavigationLink
          class="site-footer-repository icon-control"
          href={`https://github.com/${data.config.site.repository}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={data.localized.ui['footer_repository']}
          data-tooltip
          {@attach tooltip}
        >
          <IconButton name="github" />
          <span class="control-tooltip" aria-hidden="true">
            {data.localized.ui['footer_repository']}
          </span>
        </NavigationLink>
        <button
          class="site-footer-link site-footer-button icon-control"
          type="button"
          aria-label={data.localized.ui['credits']}
          data-tooltip
          {@attach tooltip}
          data-dialog-open="credits-dialog"
          data-credits-open
          onclick={openDialog.bind(null, state, 'credits')}
        >
          <IconButton name="scale-balanced" />
          <span class="control-tooltip" aria-hidden="true">
            {data.localized.ui['credits']}
          </span>
        </button>
        <button
          class="site-footer-link site-footer-button icon-control"
          type="button"
          aria-label={data.localized.ui['settings_label']}
          data-tooltip
          {@attach tooltip}
          data-dialog-open="settings-dialog"
          data-settings-open
          onclick={openDialog.bind(null, state, 'settings')}
        >
          <IconButton name="gear" />
          <span class="control-tooltip" aria-hidden="true">
            {data.localized.ui['settings_label']}
          </span>
        </button>
        <NavigationLink
          class="site-footer-link icon-control"
          data-reboot
          onclick={reboot}
          data-sveltekit-reload
          data-tooltip
          {@attach tooltip}
          href={`${data.page.url}?lobby-boot=1`}
          aria-label={data.editorialUI['reboot']}
        >
          <IconButton name="desktop" />
        </NavigationLink>
      </nav>
      <FooterMetadata
        {data}
        translationDisclaimer={data.localized.ui['translation_disclaimer']}
      />
    </footer>
  </div>
</div>
