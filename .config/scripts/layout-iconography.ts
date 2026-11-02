import './layout-helpers.ts';
import type { LayoutSnapshot } from './layout-types.ts';

export function measureIconography(): Pick<
  LayoutSnapshot,
  | 'iconBoxes'
  | 'opticalIcons'
  | 'quickContactsTransparent'
  | 'thirdPartyBadges'
  | 'coloredIcons'
  | 'beveledIcons'
  | 'localIcons'
  | 'externalLinks'
  | 'footerDisclaimer'
  | 'calendarUptime'
  | 'statisticsImages'
  | 'numericValuesFit'
  | 'brokenImages'
  | 'uniformMedia'
  | 'galleryColumns'
> {
  return {
    iconBoxes: [
      ...document.querySelectorAll<HTMLElement>(
        '.button-icon,.link-icon,.quick-contact-icon,.category-icon,.external-link-icon',
      ),
    ]
      .filter((icon): number => {
        return icon.getClientRects().length;
      })
      .every((icon): boolean => {
        const rect = icon.getBoundingClientRect();

        const image = icon.querySelector<HTMLElement>('.site-icon');

        const glyph = image?.getBoundingClientRect();

        if (!image || !glyph) {
          return false;
        }

        return (
          Math.abs(rect.width - rect.height) < 1 &&
          glyph.width <= rect.width &&
          glyph.height <= rect.height &&
          Math.abs(
            rect.left + rect.width / 2 - (glyph.left + glyph.width / 2),
          ) < 1 &&
          Math.abs(
            rect.top + rect.height / 2 - (glyph.top + glyph.height / 2),
          ) < 1
        );
      }),
    opticalIcons: [
      ...document.querySelectorAll<HTMLElement>('.site-icon-optical'),
    ]
      .filter((icon): number => {
        return icon.getClientRects().length;
      })
      .every((icon): boolean => {
        const scale = Number(
          getComputedStyle(icon)
            .getPropertyValue('--icon-optical-scale'),
        );

        const siteIconFace = window.lobbyAssertions.element(
          icon,
          '.site-icon-face',
        );

        const transform = getComputedStyle(siteIconFace).transform;

        const matrix = new DOMMatrix(transform);

        return (
          Number.isFinite(scale) &&
          scale > 0 &&
          Math.abs(matrix.a - scale) < 0.001 &&
          Math.abs(matrix.d - scale) < 0.001
        );
      }),
    quickContactsTransparent: [
      ...document.querySelectorAll<HTMLElement>('.profile .quick-contact-link'),
    ].every((link): boolean => {
      return getComputedStyle(link).backgroundColor === 'rgba(0, 0, 0, 0)';
    }),
    thirdPartyBadges: [
      ...document.querySelectorAll<HTMLElement>('.link-third-party-badge'),
    ].every((badge): boolean => {
      const fontSize = parseFloat(getComputedStyle(badge).fontSize);

      const title = badge
        .closest('.action-row')
        ?.querySelector<HTMLElement>('.link-title');

      function resolveTitleSize(): number {
        if (title) {
          return parseFloat(getComputedStyle(title).fontSize);
        }

        return fontSize;
      }

      const titleSize = resolveTitleSize();

      return (
        fontSize >= 12 &&
        fontSize / titleSize >= 0.75 &&
        getComputedStyle(badge).whiteSpace === 'nowrap'
      );
    }),
    coloredIcons: ((): boolean => {
      const icons = [
        ...document.querySelectorAll<HTMLElement>('.site-icon'),
      ];

      return (
        icons.length > 0 &&
        icons.every((icon): boolean => {
          return !getComputedStyle(icon).filter.includes('grayscale');
        })
      );
    })(),
    beveledIcons: [
      ...document.querySelectorAll<HTMLElement>('.site-icon'),
    ].every((icon): boolean => {
      const face = icon.querySelector<HTMLElement>('.site-icon-face');

      if (!face) {
        return false;
      }

      return (
        icon.dataset['finish'] === 'beveled' &&
        (getComputedStyle(icon).filter.match(/drop-shadow\(/g) ?? []).length ===
          2 &&
        getComputedStyle(face).maskImage !== 'none' &&
        getComputedStyle(face, '::before').backgroundImage.startsWith(
          'linear-gradient(',
        )
      );
    }),
    localIcons: [
      ...document.querySelectorAll<HTMLElement>('.site-icon'),
    ].every((icon): boolean => {
      const siteIconFace = window.lobbyAssertions.element(
        icon,
        '.site-icon-face',
      );

      const style = getComputedStyle(siteIconFace);

      function resolveSource(): string {
        if (style.maskImage !== 'none') {
          return style.maskImage;
        }

        return style.backgroundImage;
      }

      const source = resolveSource();

      return (
        new URL(source.slice(5, -2), location.href).origin === location.origin
      );
    }),
    externalLinks: [
      ...document.querySelectorAll<HTMLElement>(
        '.link-button[href^="http"],.quick-contact-link[href^="http"]',
      ),
    ].every((link): boolean => {
      if (!(link instanceof HTMLAnchorElement)) {
        throw new Error('Expected HTMLAnchorElement: link');
      }

      function externalIndicatorMatchesControl(): boolean {
        if (link.classList.contains('quick-contact-link')) {
          return !link.querySelector<HTMLElement>('.external-link-icon');
        }

        return Boolean(link.querySelector<HTMLElement>('.external-link-icon'));
      }

      return (
        link.target === '_blank' &&
        link.relList.contains('noopener') &&
        link.relList.contains('noreferrer') &&
        externalIndicatorMatchesControl()
      );
    }),
    footerDisclaimer:
      document.querySelectorAll<HTMLElement>('.brand-disclaimer').length ===
        1 &&
      Boolean(document.querySelector<HTMLElement>('footer .brand-disclaimer')),
    calendarUptime: [
      ...document.querySelectorAll<HTMLElement>('[data-uptime]'),
    ].every((element): boolean => {
      return element.textContent.split(', ').length === 3;
    }),
    statisticsImages:
      document.querySelectorAll<HTMLImageElement>('.statistics img').length,
    numericValuesFit: [
      ...document.querySelectorAll<HTMLElement>('.statistic dd'),
    ]
      .filter((value): number => {
        return value.getClientRects().length;
      })
      .every((value): boolean => {
        if (!value.firstChild) {
          return false;
        }

        const range = document.createRange();

        range.selectNodeContents(value.firstChild);

        return range.getClientRects().length === 1;
      }),
    brokenImages: [
      ...document.images,
    ].filter((image): boolean => {
      return (
        image.src.startsWith(location.origin) &&
        image.complete &&
        !image.naturalWidth
      );
    }).length,
    uniformMedia: [
      ...document.querySelectorAll<HTMLImageElement>('.link-visual img'),
    ].every((image): boolean => {
      return (
        getComputedStyle(image).objectFit === 'contain' &&
        image.hasAttribute('width') &&
        image.hasAttribute('height') &&
        image.loading === 'lazy'
      );
    }),
    galleryColumns: window.lobbyLayout.galleryColumns(),
  };
}
