import type { Page } from 'puppeteer-core';

export async function waitForBoot(page: Page, open: boolean): Promise<void> {
  await page.waitForFunction(
    (expected): boolean => {
      return (
        !new URL(location.href).searchParams.has('lobby-boot') &&
        document.querySelector<HTMLDialogElement>('#bios-dialog')?.open ===
          expected
      );
    },
    {},
    open,
  );
}

export function dialogIsOpen(element: Element): boolean {
  if (!(element instanceof HTMLDialogElement)) {
    throw new Error('Expected dialog');
  }

  return element.open;
}

export function inputIsChecked(element: Element): boolean {
  if (!(element instanceof HTMLInputElement)) {
    throw new Error('Expected input');
  }

  return element.checked;
}

export function activateElement(element: Element): void {
  if (!(element instanceof HTMLElement)) {
    throw new Error('Expected interactive element');
  }

  element.click();
}

export function anchorURLs(elements: Element[]): string[] {
  return elements.map((element): string => {
    if (!(element instanceof HTMLAnchorElement)) {
      throw new Error('Expected anchor');
    }

    return element.href;
  });
}

export function animationFrames(frames: number = 2): Promise<void> {
  return new Promise((accept): void => {
    let remaining = frames;

    const advance = (): void => {
      remaining -= 1;

      if (remaining <= 0) {
        accept();

        return;
      }

      requestAnimationFrame(advance);
    };

    requestAnimationFrame(advance);
  });
}
