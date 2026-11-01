export type PreviewRecord = {
  id: string | undefined;
  href: string;
};

export type CategoryPreviews = {
  id: string | undefined;
  previews: PreviewRecord[];
};

declare global {
  interface Window {
    lobbyLayout: {
      rowAligned(elements: Element[]): boolean;
      galleryColumns(): number;
      previewLinks(elements: Element[]): PreviewRecord[];
      categories(elements: Element[]): CategoryPreviews[];
    };
  }
}

export function installLayoutHelpers(): void {
  window.lobbyLayout = {
    categories(elements: Element[]): CategoryPreviews[] {
      return elements.map((element): CategoryPreviews => {
        if (!(element instanceof HTMLElement)) {
          throw new Error('Expected category');
        }

        return {
          id: element.dataset.category,
          previews: window.lobbyLayout.previewLinks([
            ...element.querySelectorAll('[data-preview-id]'),
          ]),
        };
      });
    },
    previewLinks(elements: Element[]): {
      id: string | undefined;
      href: string;
    }[] {
      return elements.map(
        (
          element,
        ): {
          id: string | undefined;
          href: string;
        } => {
          if (!(element instanceof HTMLAnchorElement)) {
            throw new Error('Expected preview anchor');
          }

          return {
            id: element.dataset.previewId,
            href: element.href,
          };
        },
      );
    },
    rowAligned(elements: Element[]): boolean {
      return elements.every((element): boolean => {
        const rect = element.getBoundingClientRect();

        return elements.every((other): boolean => {
          const otherRect = other.getBoundingClientRect();

          return (
            Math.abs(rect.top - otherRect.top) > 1 ||
            (Math.abs(rect.height - otherRect.height) < 1 &&
              Math.abs(rect.width - otherRect.width) < 1)
          );
        });
      });
    },
    galleryColumns(): number {
      const gallery = document.querySelector('.category-grid');

      if (!gallery) {
        return 0;
      }

      return getComputedStyle(gallery).gridTemplateColumns.split(' ').length;
    },
  };
}
