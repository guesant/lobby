<script lang="ts">
  import '../../../assets/css/reset.css';
  import '../../../assets/css/terminal.css';
  import '../../../assets/css/listing.css';
  import '../../../assets/css/bios.css';
  import type {
    DisplayLinkRecord,
    PageLoadData,
  } from '../../features/content/content.types.ts';
  import { navigationOrigin } from '#lib/browser/origin.ts';
  import ActionRow from '#lib/components/ActionRow.svelte';
  import ContentListHeading from '#lib/components/ContentListHeading.svelte';
  import EditorialList from '#lib/components/EditorialList.svelte';
  import FooterMetadata from '#lib/components/FooterMetadata.svelte';
  import LinkView from '#lib/components/LinkView.svelte';
  import NavigationLink from '#lib/components/NavigationLink.svelte';
  import NowActivity from '#lib/components/NowActivity.svelte';
  import { reboot } from '#lib/features/boot/reboot.controller.ts';
  import Uptime from '#lib/features/content/Uptime.svelte';
  import { emptyActionFor } from '#lib/features/listings/listing.model.ts';
  import { pagePresentation } from '#lib/features/listings/page.viewmodel.ts';
  import { currentPage } from '#lib/features/listings/presentation.model.ts';
  import { openDialog } from '#lib/features/preferences/open-dialog.controller.ts';
  import { interfaceState } from '#lib/features/preferences/preferences.viewmodel.svelte.ts';

  const state = interfaceState();

  const data: PageLoadData = $props();

  const home = $derived(data.page.id === 'home');

  const createPresentation = (): ReturnType<typeof pagePresentation> => {
    const origin = navigationOrigin();

    return pagePresentation(data, origin);
  };

  const presentation = $derived.by(createPresentation);

  const promptPath = $derived(presentation.promptPath);

  const nowActivities = $derived(presentation.nowActivities);

  const destination = $derived(presentation.destination);
</script>

{#snippet platformLink(item: DisplayLinkRecord)}
  {@const target = destination(item)}
  <ActionRow
    title={item.title}
    action={target}
    thirdPartyLabel={data.localized.ui.third_party}
    interfaceName="terminal"
    linkID={item.id}
  />
{/snippet}

<NavigationLink class="skip-link" href="#main-content">
  {data.localized.ui['skip_link']}
</NavigationLink>
<div class="terminal-app">
  <header class="terminal-titlebar" aria-label={data.config.profile.name}>
    <span class="terminal-window-controls" aria-hidden="true">
      <span class="terminal-window-dot terminal-window-dot-close"></span>
      <span class="terminal-window-dot terminal-window-dot-minimize"></span>
      <span class="terminal-window-dot terminal-window-dot-maximize"></span>
    </span>
    <p class="terminal-window-label">
      <span>{data.config.profile.username}@guesant:</span>
      <span>{promptPath}</span>
    </p>
    <button
      class="terminal-window-search"
      type="button"
      data-search-open
      onclick={openDialog.bind(null, state, 'search')}
      aria-label={data.editorialUI['search']}
    >
      <span aria-hidden="true">$</span>
      {data.editorialUI['search']}
      <kbd>Ctrl K</kbd>
    </button>
    <button
      class="terminal-window-settings"
      type="button"
      data-dialog-open="settings-dialog"
      data-settings-open
      onclick={openDialog.bind(null, state, 'settings')}
      aria-label={data.localized.ui['settings_label']}
    >
      <span aria-hidden="true">$</span>
      {data.localized.ui['settings_label']}
    </button>
  </header>
  <nav
    class="terminal-navigation"
    aria-label={data.localized.ui['navigation_label']}
  >
    <ul>
      {#each presentation.navigationPages as entry (entry.id)}
        <li>
          <NavigationLink
            href={entry.url}
            aria-current={currentPage(entry.id === data.page.id)}
          >
            <span aria-hidden="true">
              {entry.directory}
            </span>
            <span>{entry.title}</span>
          </NavigationLink>
        </li>
      {/each}
      <li>
        <NavigationLink href={data.standardHomeURL}>
          <span aria-hidden="true">interface</span>
          <span>Minecraft</span>
        </NavigationLink>
      </li>
    </ul>
  </nav>
  {#if home}
    <header class="terminal-profile">
      <p class="terminal-prompt">whoami</p>
      <h1>{data.config.profile.name}</h1>
      <p class="terminal-username">@{data.config.profile.username}</p>
      <p class="terminal-bio">{data.localized.profile.bio}</p>
      <p class="terminal-uptime">
        <span>{data.localized.ui['uptime_label']}</span>
        <Uptime
          birthDate={data.config.profile.birth_date}
          locale={data.locale}
        />
      </p>
    </header>
  {/if}
  <main class="terminal-content" id="main-content">
    {#if home}
      <section class="terminal-about">
        <p class="terminal-prompt">cat about.txt</p>
        <h2>{data.localized.presentation.title}</h2>
        <div class="terminal-about-grid">
          <ul>
            {#each data.localized.presentation.facts as fact (fact.text)}
              <li>
                {fact.text}
              </li>
            {/each}
          </ul>
          <ul>
            {#each data.localized.presentation.topics as topic (topic)}
              <li>
                {topic}
              </li>
            {/each}
          </ul>
        </div>
      </section>
      <LinkView ui={data.localized.ui} pageKey="sections" terminal />
      <section class="terminal-directory">
        <header class="terminal-section-heading">
          <p class="terminal-prompt">ls -la ~/</p>
          <h2>{data.localized.ui['home_sections_label']}</h2>
        </header>
        {#each data.homeSections as section (section.page.id)}
          <section
            class="terminal-directory-entry"
            data-category={section.page.id}
          >
            <header>
              <h3>{section.page.title}</h3>
              {#if section.page.description}
                <p>
                  {section.page.description}
                </p>
              {/if}
            </header>
            {#if section.links.length}
              <section class="content-link-group" id="links-{section.page.id}">
                <ContentListHeading
                  label={data.editorialUI['links']}
                  level={4}
                />
                <ul class="terminal-link-list divided-list">
                  {#each section.links as item (item.id)}
                    <li>
                      {@render platformLink(item)}
                    </li>
                  {/each}
                </ul>
              </section>
            {/if}
            <EditorialList
              items={section.editorial}
              ui={data.editorialUI}
              thirdPartyLabel={data.localized.ui.third_party}
              sectionID={section.page.id}
              locale={data.locale}
              interfaceName="terminal"
              {destination}
              headingLevel={4}
              emptyAction={emptyActionFor({
                home: true,
                pageURL: section.page.url,
                homeURL: '',
                sectionID: section.page.id,
                linksCount: section.links.length,
                ui: data.editorialUI,
              })}
              empty={!section.links.length}
            />
          </section>
        {/each}
      </section>
      {#each presentation.nowPages as entry (entry.id)}
        <section class="terminal-directory-entry">
          <header>
            <h3>{entry.title}</h3>
            <p>{data.now.intro}</p>
          </header>
          <ul class="terminal-link-list divided-list">
            {#each data.now.sections as section (section.id)}
              <li>
                <ActionRow
                  title={section.title}
                  action={destination({
                    url: `${entry.url}#now-${section.id}`,
                  })}
                  thirdPartyLabel={data.localized.ui.third_party}
                  interfaceName="terminal"
                />
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    {:else if data.page.id === 'now'}
      <header class="terminal-section-heading">
        <p class="terminal-prompt">cat ~/now/status.txt</p>
        <h1>{data.now.title}</h1>
        <p>{data.now.intro}</p>
      </header>
      <div class="terminal-now-list">
        {#each data.now.sections as section (section.id)}
          <section id="now-{section.id}">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </section>
        {/each}
      </div>
      {#if nowActivities.length}
        <NowActivity entries={nowActivities} labels={data.editorialUI} />
      {/if}
    {:else}
      <header class="terminal-section-heading">
        <p class="terminal-prompt">cd ~/{data.page.id}/</p>
        <h1>{data.page.title}</h1>
        {#if data.page.description}
          <p>{data.page.description}</p>
        {/if}
      </header>
      <LinkView ui={data.localized.ui} pageKey={data.page.id} terminal />
      {#if data.links.length}
        <section class="content-link-group" id="links-{data.page.id}">
          <ContentListHeading label={data.editorialUI['links']} level={2} />
          <ul class="terminal-link-list divided-list">
            {#each data.links as item (item.id)}
              <li>
                {@render platformLink(item)}
                {#if item.description}
                  <p>{item.description}</p>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}
      <EditorialList
        items={data.editorial}
        ui={data.editorialUI}
        thirdPartyLabel={data.localized.ui.third_party}
        sectionID={data.page.id}
        locale={data.locale}
        interfaceName="terminal"
        {destination}
        headingLevel={2}
        emptyAction={emptyActionFor({
          home: false,
          pageURL: data.page.url,
          homeURL: `/${data.locale}/terminal/`,
          sectionID: data.page.id,
          linksCount: data.links.length,
          ui: data.editorialUI,
        })}
        empty={!data.links.length}
      />
    {/if}
  </main>
  <footer class="terminal-footer">
    <nav
      class="terminal-footer-controls"
      aria-label={data.localized.ui['footer_aria_label']}
    >
      <NavigationLink
        href={`https://github.com/${data.config.site.repository}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {data.localized.ui['footer_repository']}
      </NavigationLink>
      <button
        type="button"
        data-dialog-open="credits-dialog"
        data-credits-open
        onclick={openDialog.bind(null, state, 'credits')}
      >
        {data.localized.ui['credits']}
      </button>
      <button
        type="button"
        data-dialog-open="settings-dialog"
        data-settings-open
        onclick={openDialog.bind(null, state, 'settings')}
      >
        {data.localized.ui['settings_label']}
      </button>
      <NavigationLink
        data-reboot
        onclick={reboot}
        data-sveltekit-reload
        href={`${data.page.url}?lobby-boot=1`}
      >
        {data.editorialUI['reboot']}
      </NavigationLink>
    </nav>
    <FooterMetadata {data} />
  </footer>
</div>
