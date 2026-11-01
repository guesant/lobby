<script lang="ts">
  import BuildMetadata from './BuildMetadata.svelte';
  import { requiredText } from './validation-primitives.ts';
  import NowActivity from './NowActivity.svelte';
  import '../assets/css/reset.css';
  import '../assets/css/terminal.css';
  import '../assets/css/listing.css';
  import '../assets/css/bios.css';
  import { interfaceState } from './preferences.svelte.ts';
  import Uptime from './Uptime.svelte';
  import { reboot } from './reboot.ts';

  const state = interfaceState();

  import LinkView from './LinkView.svelte';
  import FederationStatus from './FederationStatus.svelte';
  import EditorialList from './EditorialList.svelte';
  import ActionRow from './ActionRow.svelte';
  import ContentListHeading from './ContentListHeading.svelte';
  import { emptyActionFor } from './listing-presentation.ts';
  import { currentPage, destinationFor } from './render-utils.ts';
  import type {
    DisplayLinkRecord,
    LinkRecord,
    LinkDestination,
    PageLoadData,
  } from './site-data.ts';

  let {
    data,
  }: {
    data: PageLoadData;
  } = $props();

  let {
    config,
    editorialUI,
    localized,
    build,
    locale,
    page,
    pages,
    homeSections,
    links,
    editorial,
    now,
  } = $derived(data);

  let home = $derived(page.id === 'home');

  const directoryName = (id: string): string => {
    if (id === 'home') {
      return '~';
    }

    return id;
  };

  const promptPath = $derived.by((): string => {
    if (home) {
      return '~';
    }

    return `~/${page.id}`;
  });

  let nowActivities = $derived(
    Object.entries(data.nowActivity)
      .filter(
        ([
          key,
          value,
        ]): string | false => {
          return key !== 'updated' && typeof value === 'string' && value.trim();
        },
      ),
  );

  function destination(
    item: Pick<LinkRecord, 'url' | 'target'>,
  ): LinkDestination {
    return destinationFor(config, item, locale, 'terminal');
  }
</script>

{#snippet platformLink(item: DisplayLinkRecord)}
  {@const target = destination(item)}
  <ActionRow
    title={item.title}
    action={target}
    thirdPartyLabel={localized.ui.third_party}
    interfaceName="terminal"
    linkID={item.id}
  />
{/snippet}

<a class="skip-link" href="#main-content">{localized.ui.skip_link}</a>
<div class="terminal-app">
  <header class="terminal-titlebar" aria-label={config.profile.name}>
    <span class="terminal-window-controls" aria-hidden="true">
      <span class="terminal-window-dot terminal-window-dot-close"></span>
      <span class="terminal-window-dot terminal-window-dot-minimize"></span>
      <span class="terminal-window-dot terminal-window-dot-maximize"></span>
    </span>
    <p class="terminal-window-label">
      <span>{config.profile.username}@guesant:</span>
      <span>{promptPath}</span>
    </p>
    <button
      class="terminal-window-search"
      type="button"
      data-search-open
      onclick={(): void => {
        state.dialog = 'search';
      }}
      aria-label={editorialUI.search}
    >
      <span aria-hidden="true">$</span>
      {editorialUI.search}
      <kbd>Ctrl K</kbd>
    </button>
    <button
      class="terminal-window-settings"
      type="button"
      data-dialog-open="settings-dialog"
      data-settings-open
      onclick={(): void => {
        state.dialog = 'settings';
      }}
      aria-label={localized.ui.settings_label}
    >
      <span aria-hidden="true">$</span>
      {localized.ui.settings_label}
    </button>
  </header>
  <nav class="terminal-navigation" aria-label={localized.ui.navigation_label}>
    <ul>
      {#each pages.filter((entry): boolean => {
        return entry.type === 'home' || entry.type === 'links-page' || entry.id === 'now';
      }) as entry}<li>
        <a href={entry.url} aria-current={currentPage(entry.id === page.id)}>
          <span aria-hidden="true">
            {directoryName(entry.id)}
          </span>
          <span>{entry.title}</span>
        </a>
      </li>{/each}
      <li>
        <a href={data.standardHomeURL}>
          <span aria-hidden="true">interface</span>
          <span>Minecraft</span>
        </a>
      </li>
    </ul>
  </nav>
  {#if home}<header class="terminal-profile">
    <p class="terminal-prompt">whoami</p>
    <h1>{config.profile.name}</h1>
    <p class="terminal-username">@{config.profile.username}</p>
    <p class="terminal-bio">{localized.profile.bio}</p>
    <p class="terminal-uptime">
      <span>{localized.ui.uptime_label}</span>
      <Uptime birthDate={config.profile.birth_date} {locale} />
    </p>
  </header>{/if}
  <main class="terminal-content" id="main-content">
    {#if home}
      <section class="terminal-about">
        <p class="terminal-prompt">cat about.txt</p>
        <h2>{localized.presentation.title}</h2>
        <div class="terminal-about-grid">
          <ul>
            {#each localized.presentation.facts as fact}<li>
              {fact.text}
            </li>{/each}
          </ul>
          <ul>
            {#each localized.presentation.topics as topic}<li>
              {topic}
            </li>{/each}
          </ul>
        </div>
      </section>
      <LinkView ui={localized.ui} pageKey="sections" terminal />
      <section class="terminal-directory">
        <header class="terminal-section-heading">
          <p class="terminal-prompt">ls -la ~/</p>
          <h2>{localized.ui.home_sections_label}</h2>
        </header>
        {#each homeSections as section}<section
          class="terminal-directory-entry"
          data-category={section.page.id}
        >
          <header>
            <h3>{section.page.title}</h3>
            {#if section.page.description}<p>
              {section.page.description}
            </p>{/if}
          </header>
          {#if section.links.length}
            <section class="content-link-group" id="links-{section.page.id}">
              <ContentListHeading label={editorialUI.links} level={4} />
              <ul class="terminal-link-list divided-list">
                {#each section.links as item}<li>
                  {@render platformLink(item)}
                </li>{/each}
              </ul>
            </section>
          {/if}
          <EditorialList
            items={section.editorial}
            ui={editorialUI}
            thirdPartyLabel={localized.ui.third_party}
            sectionID={section.page.id}
            {locale}
            interfaceName="terminal"
            {destination}
            headingLevel={4}
            emptyAction={emptyActionFor({
              home: true,
              pageURL: section.page.url,
              homeURL: '',
              sectionID: section.page.id,
              linksCount: section.links.length,
              ui: editorialUI,
            })}
            empty={!section.links.length}
          />
        </section>{/each}
      </section>
      {#each pages.filter((entry): boolean => {
        return entry.id === 'now';
      }) as entry}<section class="terminal-directory-entry">
        <header>
          <h3>{entry.title}</h3>
          <p>{now.intro}</p>
        </header>
        <ul class="terminal-link-list divided-list">
          {#each now.sections as section}<li>
            <ActionRow
              title={section.title}
              action={destination({
                url: `${entry.url}#now-${section.id}`,
              })}
              thirdPartyLabel={localized.ui.third_party}
              interfaceName="terminal"
            />
          </li>{/each}
        </ul>
      </section>{/each}
    {:else if page.id === 'now'}
      <header class="terminal-section-heading">
        <p class="terminal-prompt">cat ~/now/status.txt</p>
        <h1>{now.title}</h1>
        <p>{now.intro}</p>
      </header>
      <div class="terminal-now-list">
        {#each now.sections as section}<section id="now-{section.id}">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </section>{/each}
      </div>
      {#if nowActivities.length}<NowActivity
        entries={nowActivities}
        labels={editorialUI}
      />{/if}
    {:else}
      <header class="terminal-section-heading">
        <p class="terminal-prompt">cd ~/{page.id}/</p>
        <h1>{page.title}</h1>
        {#if page.description}<p>{page.description}</p>{/if}
      </header>
      <LinkView ui={localized.ui} pageKey={page.id} terminal />
      {#if links.length}
        <section class="content-link-group" id="links-{page.id}">
          <ContentListHeading label={editorialUI.links} level={2} />
          <ul class="terminal-link-list divided-list">
            {#each links as item}<li>
              {@render platformLink(item)}
              {#if item.description}<p>{item.description}</p>{/if}
            </li>{/each}
          </ul>
        </section>
      {/if}
      <EditorialList
        items={editorial}
        ui={editorialUI}
        thirdPartyLabel={localized.ui.third_party}
        sectionID={page.id}
        {locale}
        interfaceName="terminal"
        {destination}
        headingLevel={2}
        emptyAction={emptyActionFor({
          home: false,
          pageURL: page.url,
          homeURL: `/${locale}/terminal/`,
          sectionID: page.id,
          linksCount: links.length,
          ui: editorialUI,
        })}
        empty={!links.length}
      />
    {/if}
  </main>
  <footer class="terminal-footer">
    <nav
      class="terminal-footer-controls"
      aria-label={localized.ui.footer_aria_label}
    >
      <a
        href={`https://github.com/${config.site.repository}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {localized.ui.footer_repository}
      </a>
      <button
        type="button"
        data-dialog-open="credits-dialog"
        data-credits-open
        onclick={(): void => {
          state.dialog = 'credits';
        }}
      >
        {localized.ui.credits}
      </button>
      <button
        type="button"
        data-dialog-open="settings-dialog"
        data-settings-open
        onclick={(): void => {
          state.dialog = 'settings';
        }}
      >
        {localized.ui.settings_label}
      </button>
      <a
        data-reboot
        onclick={reboot}
        data-sveltekit-reload
        href={`${page.url}?lobby-boot=1`}
      >
        {editorialUI.reboot}
      </a>
    </nav>
    <BuildMetadata
      {build}
      localCommitLabel={requiredText(
        localized.ui.local_commit,
        'local commit label',
      )}
    />
    <FederationStatus
      sources={data.federationStatus}
      labels={editorialUI}
      {locale}
    />
    <p class="brand-disclaimer">{localized.ui.brand_disclaimer}</p>
  </footer>
</div>
