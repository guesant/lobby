import type { LayoutSnapshot } from './layout-types.ts';
import './layout-helpers.ts';

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

        const summary = card.querySelector<HTMLElement>('.category-summary')!;

        const links = card.querySelector<HTMLElement>('.category-links')!;

        const summaryRect = summary.getBoundingClientRect();

        const listRect = links.getBoundingClientRect();

        const linkStyle = getComputedStyle(links);

        const icon = card
          .querySelector<HTMLElement>('.category-icon')!
          .getBoundingClientRect();

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

      return (
        style.rowGap === '0px' &&
        style.borderRadius === '0px' &&
        parseFloat(style.borderLeftWidth) === 0 &&
        parseFloat(style.borderRightWidth) === 0 &&
        parseFloat(style.borderTopWidth) +
          parseFloat(getComputedStyle(previous).borderBottomWidth) ===
          1 &&
        parseFloat(style.borderBottomWidth) === 1 &&
        style.boxShadow === 'none' &&
        items.every((item, index): boolean => {
          const link = item.querySelector<HTMLAnchorElement>('a')!;

          const row = link.getBoundingClientRect();

          const rowStyle = getComputedStyle(link);

          const itemStyle = getComputedStyle(item);

          const resolveValue3 = (): 0 | 1 => {
            if (index) {
              return 1;
            }

            return 0;
          };

          return (
            row.height >= 44 &&
            getComputedStyle(link).gridTemplateColumns.split(' ').length ===
              3 &&
            rowStyle.borderRadius === '0px' &&
            parseFloat(rowStyle.paddingTop) > 0 &&
            parseFloat(rowStyle.paddingLeft) >
              parseFloat(rowStyle.paddingTop) &&
            rowStyle.paddingLeft === rowStyle.paddingRight &&
            parseFloat(itemStyle.borderTopWidth) === resolveValue3() &&
            (!index ||
              Math.abs(
                item.getBoundingClientRect().top -
                  (items[index - 1]?.getBoundingClientRect().bottom ??
                    Number.NaN),
              ) < 1)
          );
        })
      );
    }),
    squareQuickAccess: ((): boolean => {
      const grid = document.querySelector<HTMLElement>('.quick-contacts')!;

      const buttons = [
        ...grid.children,
      ];

      const columns =
        getComputedStyle(grid).gridTemplateColumns.split(' ').length;

      const resolveValue4 = (): 4 | 8 => {
        if (
          document.querySelector<HTMLElement>('.site-shell')!.clientWidth >= 576
        ) {
          return 8;
        }

        return 4;
      };

      return (
        buttons.length === 8 &&
        columns === resolveValue4() &&
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

      const world = document.querySelector<HTMLElement>('.world-scene')!;

      const landscape = getComputedStyle(
        document.querySelector<HTMLElement>('.world-landscape')!,
      );

      const preview = getComputedStyle(
        document.querySelector<HTMLElement>('.world-landscape-preview')!,
      );

      const dim = document
        .querySelector<HTMLElement>('.world-dim')!
        .getBoundingClientRect();

      return (
        getComputedStyle(world).position === 'fixed' &&
        landscape.filter.includes('blur(8px)') &&
        root.dataset.landscapeReady === 'true' &&
        Number(landscape.opacity) === 1 &&
        Number(preview.opacity) === 0 &&
        dim.top === 0 &&
        dim.left === 0 &&
        dim.height === innerHeight &&
        getComputedStyle(document.querySelector<HTMLElement>('.site-shell')!)
          .filter === 'none'
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
        document.querySelector<HTMLElement>('.home-introduction')!;

      if (!introduction) {
        return true;
      }

      const grid = introduction.querySelector<HTMLElement>(
        '.about-context-grid',
      )!;

      const site = introduction.querySelector<HTMLElement>('.about-site')!;

      const siteStyle = getComputedStyle(site);

      const wide =
        document.querySelector<HTMLElement>('.site-shell')!.clientWidth >= 448;

      const rect = introduction.getBoundingClientRect();

      const navigation =
        document.querySelector<HTMLElement>('.footer-navigation')!;

      const resolveValue5 = (): 1 | 2 => {
        if (wide) {
          return 2;
        }

        return 1;
      };

      const resolveValue6 = (): boolean => {
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
      };

      return (
        introduction.querySelectorAll<HTMLElement>('.about-fact').length ===
          3 &&
        introduction.querySelectorAll<HTMLElement>('.about-topics > li')
          .length === 5 &&
        !introduction.querySelector<HTMLElement>(
          'a,button,details,.presentation-title,.presentation-intro,.presentation-focus',
        )! &&
        getComputedStyle(grid).gridTemplateColumns.split(' ').length ===
          resolveValue5() &&
        resolveValue6() &&
        [
          ...introduction.querySelectorAll<HTMLElement>(
            '.about-fact-icon,.about-topic-check',
          ),
        ].every((icon): boolean => {
          const box = icon.getBoundingClientRect();

          return Math.abs(box.width - box.height) < 1;
        }) &&
        navigation.closest('.site-footer') !== null &&
        navigation.getBoundingClientRect().top >=
          document
            .querySelector<HTMLElement>('.home-updates')!
            .getBoundingClientRect().bottom &&
        navigation.querySelectorAll<HTMLAnchorElement>(
          '.footer-navigation-links a',
        ).length === 15
      );
    })(),
    galleryAligned: [
      ...document.querySelectorAll<HTMLElement>('.category-card'),
    ].every((card, _, cards): boolean => {
      const rect = card.getBoundingClientRect();

      const grid = document
        .querySelector<HTMLElement>('.category-grid')!
        .getBoundingClientRect();

      return (
        Math.abs(rect.left - grid.left) < 1 &&
        Math.abs(rect.width - grid.width) < 1 &&
        !card.querySelector<HTMLElement>('.category-main-link')! &&
        !card.querySelector<HTMLAnchorElement>('.category-title a')! &&
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
    settingsClosed:
      !document.querySelector<HTMLDialogElement>('#settings-dialog')!.open,
    isolatedPreferences: [
      ...document.querySelectorAll<HTMLElement>('.toggle-group'),
    ].every((group): Element | null => {
      return group.closest('#settings-dialog');
    }),
  };
}
