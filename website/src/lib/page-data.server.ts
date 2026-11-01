import { error } from '@sveltejs/kit';
import { resolvePageContext } from './page-route.server.ts';
import { localizedURL } from './configuration.ts';
import { requiredText } from './validation-primitives.ts';
import { editorialItems } from './editorial-items.ts';
import {
  type LinkRecord,
  type DisplayLinkRecord,
  type EditorialRecord,
  type PageRecord,
  type PageLoadData,
  type SiteData,
} from './site-data.ts';
import {
  getSiteData,
  getFederationStatus,
  pagesFor,
  sectionLinks,
} from './site-data.server.ts';

export async function loadPageData(
  path: string,
  isLanguageEntry: boolean = false,
  websiteRoot: string = process.cwd(),
): Promise<PageLoadData> {
  const data = await getSiteData(websiteRoot);

  const {
    locale,
    interfaceName,
    pages,
    standardPages,
    terminalPages,
    page
  } =
    resolvePageContext(data, path);

  const pageID = page.id;

  const localized = data.links.locales[locale];

  const editorialUI = data.editorial.ui[locale];

  if (!localized || !editorialUI) {
    error(404, 'Page not found');
  }

  const build = buildMetadata(data, localized, locale);

  const resolveLinks = (): DisplayLinkRecord[] => {
    if (page.section) {
      return sectionLinks(data, page.section, locale);
    }

    return [];
  };

  const links = resolveLinks();

  const resolveEditorial = (): EditorialRecord[] => {
    if (page.section) {
      return editorialItems(data, page.id, locale);
    }

    return [];
  };

  const editorial = resolveEditorial();

  const now = data.links.now[locale] || data.links.now.en;

  if (!now) {
    throw new Error('Missing default personal update');
  }

  const categoryPages = pages.filter((entry): boolean => {
    return entry.type === 'links-page';
  });

  const standardHomePage = standardPages.find((entry): boolean => {
    return entry.id === 'home';
  });

  const firstStandardPage = standardPages[0];

  const firstTerminalPage = terminalPages[0];

  if (!standardHomePage || !firstStandardPage || !firstTerminalPage) {
    error(404, 'Page not found');
  }

  const quickLinks = data.links.quick_contacts.flatMap(
    (id): PageLoadData['quickLinks'] => {
      for (const section of data.links.sections) {
        const item = (section.links || []).find((link: LinkRecord): boolean => {
          return link.id === id && visible(link);
        });

        if (item) {
          const labels = item.labels?.[locale] || item.labels?.en;

          if (!labels) {
            throw new Error(`Missing link labels: ${id}`);
          }

          return [
            {
              ...item,
              title: labels.title,
              url: localizedURL(item, locale),
            },
          ];
        }
      }

      return [];
    },
  );

  const languageRoutes = data.links.language_options.map(
    (
      option,
    ): {
      ogLocale: string;
      available: boolean;
      standardURL: string;
      terminalURL: string;
      id: string;
      path: string;
      label: string;
      hreflang: string;
    } => {
      const standard = pagesFor(data, option.id, 'minecraft');

      const terminal = pagesFor(data, option.id, 'terminal');

      const standardPage = standard.find((entry): boolean => {
        return entry.id === pageID;
      });

      const terminalPage = terminal.find((entry): boolean => {
        return entry.id === pageID;
      });

      const resolveStandardURL = (): string => {
        if (standardPage && !standardPage.fallback) {
          return standardPage.url;
        }

        return standard[0]?.url || '/';
      };

      const resolveTerminalURL = (): string => {
        if (terminalPage && !terminalPage.fallback) {
          return terminalPage.url;
        }

        return terminal[0]?.url || '/';
      };

      return {
        ...option,
        ogLocale: data.links.locales[option.id]?.ui.og_locale || '',
        available: Boolean(standardPage && !standardPage.fallback),
        standardURL: resolveStandardURL(),
        terminalURL: resolveTerminalURL(),
      };
    },
  );

  const clientConfig = {
    profile: data.links.profile,
    theme: {
      appearance: data.links.theme.appearance,
      animations_enabled: data.links.theme.animations_enabled,
    },
    navigation: {
      home: data.links.navigation.home,
    },
    site: data.links.site,
    language_preference: data.links.language_preference,
  };

  const resolveHomeSections = (): {
    page: PageRecord;
    links: DisplayLinkRecord[];
    editorial: EditorialRecord[];
  }[] => {
    if (pageID === 'home') {
      return categoryPages.map(
        (
          entry,
        ): {
          page: PageRecord;
          links: DisplayLinkRecord[];
          editorial: EditorialRecord[];
        } => {
          if (!entry.section) {
            throw new Error(`Missing section: ${entry.id}`);
          }

          return {
            page: pageSummary(entry),
            links: sectionLinks(data, entry.section, locale),
            editorial: editorialItems(data, entry.id, locale),
          };
        },
      );
    }

    return [];
  };

  const homeSections = resolveHomeSections();

  return {
    isLanguageEntry,
    federationStatus: await getFederationStatus(websiteRoot),
    config: clientConfig,
    nowActivity: data.editorial.now[locale] || {},
    editorialUI,
    localized,
    build,
    credits: data.credits,
    locale,
    interfaceName,
    page: pageSummary(page),
    pages: pages.map(pageSummary),
    languageRoutes,
    standardHomeURL: standardHomePage.url,
    standardPageURL:
      standardPages.find((entry): boolean => {
        return entry.id === pageID && !entry.fallback;
      })?.url || firstStandardPage.url,
    terminalPageURL:
      terminalPages.find((entry): boolean => {
        return entry.id === pageID && !entry.fallback;
      })?.url || firstTerminalPage.url,
    homeSections,
    quickLinks,
    links,
    editorial,
    now,
  };
}

function buildMetadata(
  data: SiteData,
  localized: SiteData['links']['locales'][string],
  locale: string,
): PageLoadData['build'] {
  const repositoryURL = `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${process.env.GITHUB_REPOSITORY || data.links.site.repository}`;

  const commitSHA = process.env.GITHUB_SHA || '';

  const runID = process.env.GITHUB_RUN_ID || '';

  const uiText = (key: string): string => {
    return requiredText(localized.ui[key], `links.locales.${locale}.ui.${key}`);
  };

  const resolveCommitLabel = (): string => {
    if (commitSHA.length > 7) {
      return commitSHA.slice(0, 7);
    }

    return uiText('local_commit');
  };

  const resolveWorkflowURL = (): string => {
    if (runID) {
      return `${repositoryURL}/actions/runs/${runID}`;
    }

    return repositoryURL;
  };

  const resolveBuildLabel = (): string => {
    if (runID) {
      return uiText('footer_workflow');
    }

    return uiText('local_build');
  };

  const build = {
    commitLabel: resolveCommitLabel(),
    commitURL: `${repositoryURL}/commit/${commitSHA}`,
    versionLabel: uiText('footer_version'),
    workflowLabel: uiText('footer_workflow'),
    buildLabel: resolveBuildLabel(),
    workflowURL: resolveWorkflowURL(),
  };

  return build;
}

function pageSummary(entry: PageRecord): PageRecord {
  const summary = {
    ...entry,
  };

  delete summary.section;
  delete summary.links;

  return summary;
}

const visible = (entry: {
  enabled?: boolean;
  public?: boolean;
  private?: boolean;
  draft?: boolean;
}): boolean => {
  return (
    entry?.enabled !== false &&
    entry?.public !== false &&
    !entry?.private &&
    !entry?.draft
  );
};
