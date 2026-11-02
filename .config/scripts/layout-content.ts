import './layout-helpers.ts';
import type { LayoutSnapshot } from './layout-types.ts';

export function measureContent(): Pick<
  LayoutSnapshot,
  | 'categoryPreviewColumns'
  | 'rusticGeometry'
  | 'contiguousLists'
  | 'squareQuickAccess'
  | 'layeredBackground'
  | 'deferredOrnaments'
  | 'minimalContext'
  | 'galleryAligned'
  | 'galleryLinksAccessible'
  | 'footerAligned'
  | 'settingsClosed'
  | 'isolatedPreferences'
> {
  const settingsDialog =
    document.querySelector<HTMLDialogElement>('#settings-dialog');

  if (settingsDialog === null) {
    throw new Error('Missing required settingsDialog');
  }

  return {
    categoryPreviewColumns: [
      ...document.querySelectorAll<HTMLElement>('.category-preview'),
    ].every((preview): boolean => {
      return (
        getComputedStyle(preview).gridTemplateColumns.split(' ').length === 1
      );
    }),
    rusticGeometry: ((): boolean => {
      const sections = [
        ...document.querySelectorAll<HTMLElement>('.category-card'),
      ];

      return sections.every((card): boolean => {
        const style = getComputedStyle(card);

        const summary = window.lobbyAssertions.element(
          card,
          '.category-summary',
        );

        const links = window.lobbyAssertions.element(card, '.category-links');

        const summaryRect = summary.getBoundingClientRect();

        const listRect = links.getBoundingClientRect();

        const linkStyle = getComputedStyle(links);

        const categoryIcon = window.lobbyAssertions.element(
          card,
          '.category-icon',
        );

        const icon = categoryIcon.getBoundingClientRect();

        return (
          style.gridTemplateColumns.split(' ').length === 1 &&
          Math.abs(icon.width - icon.height) < 1 &&
          summaryRect.bottom <= listRect.top &&
          Math.abs(summaryRect.width - listRect.width) < 1 &&
          parseFloat(linkStyle.borderInlineStartWidth) === 0
        );
      });
    })(),
    contiguousLists: [
      ...document.querySelectorAll<HTMLElement>('.category-preview'),
    ].every((list): boolean => {
      const previous = list.previousElementSibling;

      if (!previous) {
        return false;
      }

      const style = getComputedStyle(list);

      const items = [
        ...list.children,
      ];

      function listEdgesMatch(previous: Element): boolean {
        return (
          parseFloat(style.borderLeftWidth) === 0 &&
          parseFloat(style.borderRightWidth) === 0 &&
          parseFloat(style.borderTopWidth) +
            parseFloat(getComputedStyle(previous).borderBottomWidth) ===
            1 &&
          parseFloat(style.borderBottomWidth) === 1
        );
      }

      return (
        style.rowGap === '0px' &&
        style.borderRadius === '0px' &&
        listEdgesMatch(previous) &&
        style.boxShadow === 'none' &&
        items.every((item, index): boolean => {
          const link = item.querySelector<HTMLAnchorElement>('a');

          if (link === null) {
            throw new Error('Missing required link');
          }

          const row = link.getBoundingClientRect();

          const rowStyle = getComputedStyle(link);

          const itemStyle = getComputedStyle(item);

          function expectedRowDivider(): 0 | 1 {
            if (index) {
              return 1;
            }

            return 0;
          }

          function rowSpacingMatches(): boolean {
            return (
              parseFloat(rowStyle.paddingTop) > 0 &&
              parseFloat(rowStyle.paddingLeft) >
                parseFloat(rowStyle.paddingTop) &&
              rowStyle.paddingLeft === rowStyle.paddingRight &&
              parseFloat(itemStyle.borderTopWidth) === expectedRowDivider()
            );
          }

          function followsPreviousRow(): boolean {
            return (
              !index ||
              Math.abs(
                item.getBoundingClientRect().top -
                  (items[index - 1]?.getBoundingClientRect().bottom ??
                    Number.NaN),
              ) < 1
            );
          }

          return (
            row.height >= 44 &&
            getComputedStyle(link).gridTemplateColumns.split(' ').length ===
              3 &&
            rowStyle.borderRadius === '0px' &&
            rowSpacingMatches() &&
            followsPreviousRow()
          );
        })
      );
    }),
    squareQuickAccess: ((): boolean => {
      const grid = window.lobbyAssertions.element(document, '.quick-contacts');

      const buttons = [
        ...grid.children,
      ];

      const columns =
        getComputedStyle(grid).gridTemplateColumns.split(' ').length;

      function expectedQuickContactColumns(): 4 | 8 {
        const siteShell = window.lobbyAssertions.element(
          document,
          '.site-shell',
        );

        if (siteShell.clientWidth >= 576) {
          return 8;
        }

        return 4;
      }

      return (
        buttons.length === 8 &&
        columns === expectedQuickContactColumns() &&
        buttons.every((button): boolean => {
          const rect = button.getBoundingClientRect();

          return (
            Math.abs(rect.width - rect.height) < 1 &&
            rect.width >= parseFloat(getComputedStyle(button).minHeight) - 1 &&
            Math.abs(
              rect.width -
                (buttons[0]?.getBoundingClientRect().width ?? Number.NaN),
            ) < 1
          );
        })
      );
    })(),
    layeredBackground: ((): boolean => {
      const root = document.documentElement;

      const world = document.querySelector<HTMLElement>('.world-scene');

      const shell = document.querySelector<HTMLElement>('.site-shell');

      if (!world || !shell) {
        return false;
      }

      const worldLandscape = window.lobbyAssertions.element(
        document,
        '.world-landscape',
      );

      const landscape = getComputedStyle(worldLandscape);

      const worldLandscapePreview = window.lobbyAssertions.element(
        document,
        '.world-landscape-preview',
      );

      const preview = getComputedStyle(worldLandscapePreview);

      const worldDim = window.lobbyAssertions.element(document, '.world-dim');

      const dim = worldDim.getBoundingClientRect();

      function landscapeDecoded(): boolean {
        return (
          landscape.filter.includes('blur(8px)') &&
          root.dataset['landscapeReady'] === 'true' &&
          Number(landscape.opacity) === 1 &&
          Number(preview.opacity) === 0
        );
      }

      return (
        getComputedStyle(world).position === 'fixed' &&
        landscapeDecoded() &&
        dim.top === 0 &&
        dim.left === 0 &&
        dim.height === innerHeight &&
        getComputedStyle(shell).filter === 'none'
      );
    })(),
    deferredOrnaments: [
      ...document.querySelectorAll<HTMLImageElement>(
        '.suspension-lantern,.suspension-terminal-lower',
      ),
    ].every((image): boolean => {
      return (
        image.loading === 'lazy' &&
        image.decoding === 'async' &&
        image.fetchPriority === 'low'
      );
    }),
    minimalContext: ((): boolean => {
      const introduction =
        document.querySelector<HTMLElement>('.home-introduction');

      if (!introduction) {
        return true;
      }

      const grid = introduction.querySelector<HTMLElement>(
        '.about-context-grid',
      );

      const site = window.lobbyAssertions.element(introduction, '.about-site');

      const siteStyle = getComputedStyle(site);

      const siteShell = window.lobbyAssertions.element(document, '.site-shell');

      const wide = siteShell.clientWidth >= 448;

      const rect = introduction.getBoundingClientRect();

      const navigation =
        document.querySelector<HTMLElement>('.footer-navigation');

      const updates = document.querySelector<HTMLElement>('.home-updates');

      if (!grid || !navigation || !updates) {
        return false;
      }

      function expectedAboutColumns(): 1 | 2 {
        if (wide) {
          return 2;
        }

        return 1;
      }

      function aboutDividerMatchesViewport(): boolean {
        if (wide) {
          return (
            parseFloat(siteStyle.borderInlineStartWidth) === 1 &&
            parseFloat(siteStyle.borderBlockStartWidth) === 0 &&
            rect.height < rect.width
          );
        }

        return (
          parseFloat(siteStyle.borderBlockStartWidth) === 1 &&
          parseFloat(siteStyle.borderInlineStartWidth) === 0
        );
      }

      function aboutFactsPresent(context: HTMLElement): boolean {
        return (
          context.querySelectorAll<HTMLElement>('.about-fact').length === 3 &&
          context.querySelectorAll<HTMLElement>('.about-topics > li').length ===
            5 &&
          !context.querySelector<HTMLElement>(
            'a,button,details,.presentation-title,.presentation-intro,.presentation-focus',
          )
        );
      }

      function aboutGridMatches(
        grid: HTMLElement,
        context: HTMLElement,
      ): boolean {
        return (
          getComputedStyle(grid).gridTemplateColumns.split(' ').length ===
            expectedAboutColumns() &&
          aboutDividerMatchesViewport() &&
          [
            ...context.querySelectorAll<HTMLElement>(
              '.about-fact-icon,.about-topic-check',
            ),
          ].every((icon): boolean => {
            const box = icon.getBoundingClientRect();

            return Math.abs(box.width - box.height) < 1;
          })
        );
      }

      function footerNavigationPlaced(
        navigation: HTMLElement,
        updates: HTMLElement,
      ): boolean {
        return (
          navigation.closest('.site-footer') !== null &&
          navigation.getBoundingClientRect().top >=
            updates.getBoundingClientRect().bottom &&
          navigation.querySelectorAll<HTMLAnchorElement>(
            '.footer-navigation-links a',
          ).length === 15
        );
      }

      return (
        aboutFactsPresent(introduction) &&
        aboutGridMatches(grid, introduction) &&
        footerNavigationPlaced(navigation, updates)
      );
    })(),
    galleryAligned: [
      ...document.querySelectorAll<HTMLElement>('.category-card'),
    ].every((card, _, cards): boolean => {
      const rect = card.getBoundingClientRect();

      const categoryGrid = window.lobbyAssertions.element(
        document,
        '.category-grid',
      );

      const grid = categoryGrid.getBoundingClientRect();

      return (
        Math.abs(rect.left - grid.left) < 1 &&
        Math.abs(rect.width - grid.width) < 1 &&
        !card.querySelector<HTMLElement>('.category-main-link') &&
        !card.querySelector<HTMLAnchorElement>('.category-title a') &&
        cards.every((other): boolean => {
          return Math.abs(other.getBoundingClientRect().left - grid.left) < 1;
        })
      );
    }),
    galleryLinksAccessible: [
      ...document.querySelectorAll<HTMLElement>('.category-preview-link'),
    ].every((link): boolean => {
      if (!link.parentElement) {
        return false;
      }

      return (
        getComputedStyle(link).position === 'relative' &&
        link.parentElement.matches('.link-card') &&
        link.parentElement.closest('a') === null
      );
    }),
    footerAligned: window.lobbyLayout.rowAligned([
      ...document.querySelectorAll<HTMLElement>('.site-footer-content > *'),
    ]),
    settingsClosed: !settingsDialog.open,
    isolatedPreferences: [
      ...document.querySelectorAll<HTMLElement>('.toggle-group'),
    ].every((group): Element | null => {
      return group.closest('#settings-dialog');
    }),
  };
}
