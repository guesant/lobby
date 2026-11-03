import './layout-helpers.ts';
import type { LayoutSnapshot } from './layout.types.ts';

export function measureGeometry(): Pick<
  LayoutSnapshot,
  | 'regionsAligned'
  | 'overflow'
  | 'mainContentGeometry'
  | 'cardsAligned'
  | 'statisticsAligned'
  | 'navigationCompact'
  | 'controlsFit'
  | 'columns'
  | 'languageControls'
  | 'noControlMotion'
  | 'railConnections'
  | 'railContentClearance'
  | 'anchoredLanterns'
  | 'repeatingFrames'
> {
  return {
    regionsAligned: ((): boolean => {
      const siteShell = window.lobbyAssertions.element(document, '.site-shell');

      const shell = siteShell.getBoundingClientRect();

      const profileNavigation = window.lobbyAssertions.element(
        document,
        '.profile-navigation',
      );

      const navigation = profileNavigation.getBoundingClientRect();

      const pageContent = window.lobbyAssertions.element(
        document,
        '.page-content',
      );

      const content = pageContent.getBoundingClientRect();

      const siteFooter = window.lobbyAssertions.element(
        document,
        '.site-footer',
      );

      const footer = siteFooter.getBoundingClientRect();

      const profileValue = window.lobbyAssertions.element(document, '.profile');

      const profile = profileValue.getBoundingClientRect();

      const quickContactsValue = window.lobbyAssertions.element(
        document,
        '.quick-contacts',
      );

      const quickContacts = quickContactsValue.getBoundingClientRect();

      const suspended = window.lobbyAssertions.element(
        document,
        '.suspended-content',
      );

      const suspendedStyle = getComputedStyle(suspended);

      const insetStart = parseFloat(suspendedStyle.paddingLeft);

      const insetEnd = parseFloat(suspendedStyle.paddingRight);

      const outerAligned = [
        profile,
        footer,
      ].every((rect): boolean => {
        return (
          Math.abs(rect.width - shell.width) < 1 &&
          Math.abs(rect.left - shell.left) < 1 &&
          Math.abs(rect.right - shell.right) < 1
        );
      });

      const aligned =
        outerAligned &&
        [
          content,
        ].every((rect): boolean => {
          return (
            Math.abs(rect.left - shell.left - insetStart) < 1 &&
            Math.abs(shell.right - rect.right - insetEnd) < 1
          );
        });

      function headerStackAligned(): boolean {
        return (
          profile.top <= quickContacts.top &&
          profile.bottom >= quickContacts.bottom &&
          navigation.bottom <= quickContacts.top &&
          profile.bottom >= navigation.bottom &&
          quickContacts.bottom <= content.top
        );
      }

      function horizontalBoundsAligned(): boolean {
        return (
          navigation.left >= profile.left &&
          navigation.right <= profile.right &&
          Math.abs(footer.width - profile.width) < 1 &&
          quickContacts.left >= profile.left &&
          quickContacts.right <= profile.right
        );
      }

      return (
        aligned &&
        headerStackAligned() &&
        horizontalBoundsAligned() &&
        Math.abs(
          navigation.left +
            navigation.width / 2 -
            (content.left + content.width / 2),
        ) < 1 &&
        Math.abs(
          footer.left + footer.width / 2 - (content.left + content.width / 2),
        ) < 1 &&
        Math.abs(
          content.left + content.width / 2 - (shell.left + shell.width / 2),
        ) < 1
      );
    })(),
    overflow: document.documentElement.scrollWidth > innerWidth,
    mainContentGeometry: ((): boolean => {
      const main = window.lobbyAssertions.element(document, '#main-content');

      const shell = window.lobbyAssertions.element(document, '.site-shell');

      const rect = main.getBoundingClientRect();

      const shellRect = shell.getBoundingClientRect();

      const suspendedContent = window.lobbyAssertions.element(
        document,
        '.suspended-content',
      );

      const suspendedStyle = getComputedStyle(suspendedContent);

      const availableWidth =
        shellRect.width -
        parseFloat(suspendedStyle.paddingLeft) -
        parseFloat(suspendedStyle.paddingRight);

      return (
        Math.abs(rect.width - Math.min(640, availableWidth)) < 1 &&
        Math.abs(
          rect.left + rect.width / 2 - (shellRect.left + shellRect.width / 2),
        ) < 1
      );
    })(),
    cardsAligned: window.lobbyLayout.rowAligned([
      ...document.querySelectorAll<HTMLElement>('.link-button'),
    ]),
    statisticsAligned: [
      ...document.querySelectorAll<HTMLElement>('.link-row'),
    ].every((row): boolean => {
      const statistics = [
        ...row.querySelectorAll<HTMLElement>('.statistics'),
      ];

      function sameStatisticsRow(entry: HTMLElement): boolean {
        return statistics.every((other): boolean => {
          const rect = entry.getBoundingClientRect();

          const compared = other.getBoundingClientRect();

          return (
            Math.abs(rect.top - compared.top) < 1 &&
            Math.abs(rect.bottom - compared.bottom) < 1
          );
        });
      }

      return innerWidth < 896 || statistics.every(sameStatisticsRow);
    }),
    navigationCompact:
      !document.querySelector<HTMLElement>('.profile-navigation details') &&
      document.querySelector<HTMLElement>('.header-navigation-links') !== null,
    controlsFit: [
      ...document.querySelectorAll<HTMLElement>(
        '.header-navigation-links a,.ui-button,.site-footer-content > *',
      ),
    ]
      .filter((element): number => {
        return element.getClientRects().length;
      })
      .every((element): boolean => {
        return (
          element.scrollWidth <= element.clientWidth &&
          element.getBoundingClientRect().height >= 44
        );
      }),
    columns: [
      ...document.querySelectorAll<HTMLElement>('.link-row'),
    ].map((list): number => {
      return getComputedStyle(list).gridTemplateColumns.split(' ').length;
    }),
    languageControls:
      document.querySelectorAll<HTMLSelectElement>('.language-select').length,
    noControlMotion: [
      ...document.querySelectorAll<HTMLSelectElement>(
        '.link-button,.quick-contact-link,.header-navigation-links a,.toggle-button,.language-select,.site-footer-content > *',
      ),
    ].every((element): boolean => {
      return (
        getComputedStyle(element).transform === 'none' &&
        getComputedStyle(element)
          .transitionDuration.split(', ')
          .every((duration): boolean => {
            return duration === '0s';
          })
      );
    }),
    railConnections: [
      ...document.querySelectorAll<HTMLElement>('.suspension-rail'),
    ].every((rail): boolean => {
      const frame = rail.getBoundingClientRect();

      if (getComputedStyle(rail).display === 'none') {
        return frame.width === 0;
      }

      const terminals = [
        ...rail.querySelectorAll<HTMLImageElement>('.suspension-terminal'),
      ];

      const suspensionBody = window.lobbyAssertions.element(
        rail,
        '.suspension-body',
      );

      const body = suspensionBody.getBoundingClientRect();

      const chains = [
        ...rail.querySelectorAll<HTMLElement>('.suspension-chain'),
      ];

      function hasPair<T>(values: T[]): values is [
        T,
        T,
        ...T[],
      ] {
        return values[0] !== undefined && values[1] !== undefined;
      }

      if (!hasPair(chains) || !hasPair(terminals)) {
        return false;
      }

      const upper = chains[0].getBoundingClientRect();

      const lower = chains[1].getBoundingClientRect();

      const first = terminals[0].getBoundingClientRect();

      const last = terminals[1].getBoundingClientRect();

      const lantern = rail.querySelector<HTMLElement>(
        '.suspension-lantern-middle',
      );

      const lanternRect = lantern?.getBoundingClientRect();

      const profile = window.lobbyAssertions.element(document, '.profile');

      const footer = window.lobbyAssertions.element(document, '.site-footer');

      const headerRect = profile.getBoundingClientRect();

      const footerRect = footer.getBoundingClientRect();

      const headerBorder = parseFloat(
        getComputedStyle(profile).borderBottomWidth,
      );

      const couplingSeat =
        parseFloat(
          getComputedStyle(rail)
            .getPropertyValue('--rail-coupling-seat'),
        ) * parseFloat(getComputedStyle(document.documentElement).fontSize);

      const footerBorder = parseFloat(getComputedStyle(footer).borderTopWidth);

      const atStart = rail.classList.contains('suspension-rail-start');

      const center = frame.left + frame.width / 2;

      function resolveHeaderJoint(): number {
        if (atStart) {
          return headerRect.left + headerBorder / 2;
        }

        return headerRect.right - headerBorder / 2;
      }

      const headerJoint = resolveHeaderJoint();

      function resolveFooterJoint(): number {
        if (atStart) {
          return footerRect.left + footerBorder / 2;
        }

        return footerRect.right - footerBorder / 2;
      }

      const footerJoint = resolveFooterJoint();

      function couplingAligned(): boolean {
        return (
          Math.abs(
            frame.top + couplingSeat - (headerRect.bottom - headerBorder / 2),
          ) < 1 &&
          Math.abs(
            frame.bottom - couplingSeat - (footerRect.top + footerBorder / 2),
          ) < 1 &&
          Math.abs(center - headerJoint) < 1 &&
          Math.abs(center - footerJoint) < 1 &&
          headerJoint >= first.left &&
          headerJoint <= first.right &&
          footerJoint >= last.left &&
          footerJoint <= last.right
        );
      }

      const upperTerminal = terminals[0];

      const lowerTerminal = terminals[1];

      function terminalConnections(): boolean {
        return (
          terminals.length === 2 &&
          upperTerminal.src === lowerTerminal.src &&
          getComputedStyle(upperTerminal).transform === 'none' &&
          getComputedStyle(lowerTerminal).transform ===
            'matrix(1, 0, 0, -1, 0, 0)' &&
          Math.abs(first.top - frame.top) < 1 &&
          Math.abs(first.bottom - body.top) < 1 &&
          Math.abs(body.bottom - last.top) < 1 &&
          Math.abs(last.bottom - frame.bottom) < 1
        );
      }

      function chainContinuity(): boolean {
        return (
          Math.abs(upper.top - body.top) < 1 &&
          Math.abs(upper.bottom - lower.top) < 1 &&
          Math.abs(lower.bottom - body.bottom) < 1 &&
          (!lanternRect ||
            (lanternRect.top < upper.bottom &&
              lanternRect.bottom > lower.top)) &&
          chains.every((chain): boolean => {
            return getComputedStyle(chain).backgroundSize.endsWith('auto');
          }) &&
          [
            ...rail.querySelectorAll<HTMLImageElement>('img'),
          ].every((image): boolean => {
            const rect = image.getBoundingClientRect();

            const expected =
              Number(image.getAttribute('width')) /
              Number(image.getAttribute('height'));

            return (
              rect.top >= frame.top - 1 &&
              rect.bottom <= frame.bottom + 1 &&
              Math.abs(rect.width / rect.height - expected) < 0.01
            );
          })
        );
      }

      return couplingAligned() && terminalConnections() && chainContinuity();
    }),
    railContentClearance: ((): boolean => {
      const suspended = window.lobbyAssertions.element(
        document,
        '.suspended-content',
      );

      const style = getComputedStyle(suspended);

      const rails = [
        ...suspended.querySelectorAll<HTMLElement>('.suspension-rail'),
      ];

      if (
        rails.every((rail): boolean => {
          return getComputedStyle(rail).display === 'none';
        })
      ) {
        return (
          parseFloat(style.paddingLeft) === 0 &&
          parseFloat(style.paddingRight) === 0
        );
      }

      if (!rails[0] || !rails[1]) {
        return false;
      }

      const gap =
        parseFloat(style.paddingLeft) -
        (rails[0].getBoundingClientRect().right -
          suspended.getBoundingClientRect().left);

      const start = rails[0].getBoundingClientRect();

      const end = rails[1].getBoundingClientRect();

      return (
        gap > 0 &&
        [
          ...suspended.children,
        ]
          .filter((element): boolean => {
            return !element.classList.contains('suspension-rail');
          })
          .every((element): boolean => {
            const rect = element.getBoundingClientRect();

            return (
              rect.left - start.right >= gap - 1 &&
              end.left - rect.right >= gap - 1
            );
          })
      );
    })(),
    anchoredLanterns: ((): boolean => {
      const anchors = [
        ...document.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
      ];

      if (!anchors.length) {
        return false;
      }

      const content = window.lobbyAssertions.element(
        document,
        '.suspended-content',
      );

      const gap = parseFloat(getComputedStyle(content).rowGap);

      function inspectNestedEntry(body: HTMLElement): boolean {
        if (!body.getClientRects().length) {
          return true;
        }

        const frame = body.getBoundingClientRect();

        const lanterns = [
          ...body.querySelectorAll<HTMLElement>('[data-rail-lantern]'),
        ];

        return (
          lanterns.length === anchors.length &&
          lanterns.every((lantern, index): boolean => {
            const anchor = anchors[index];

            if (!anchor) {
              return false;
            }

            const expected =
              anchor.getBoundingClientRect().bottom + gap / 2 - frame.top;

            const actual = parseFloat(
              lantern.style.getPropertyValue('--rail-lantern-position'),
            );

            const image = lantern.getBoundingClientRect();

            return (
              Math.abs(expected - actual) < 1 &&
              Math.abs(
                image.left + image.width / 2 - frame.left - frame.width / 2,
              ) < 1
            );
          })
        );
      }

      return [
        ...content.querySelectorAll<HTMLElement>('.suspension-body'),
      ].every(inspectNestedEntry);
    })(),
    repeatingFrames: [
      ...document.querySelectorAll<HTMLDialogElement>(
        '.profile,.quick-contact-link,.presentation,.category-card,.link-sections,.site-footer,.presentation-eyebrow,.section-label,.presentation-art,.app-dialog',
      ),
    ].every((element): boolean => {
      return getComputedStyle(element).borderImageRepeat === 'repeat';
    }),
  };
}
