import type { ElementHandle } from 'puppeteer-core';

export async function rowPaddingPoint(row: ElementHandle): Promise<{
  x: number;
  y: number;
}> {
  return row.evaluate(
    (
      element,
    ): {
      x: number;
      y: number;
    } => {
      const rect = element.getBoundingClientRect();

      const style = getComputedStyle(element);

      return {
        x:
          rect.left +
          Number.parseFloat(style.borderInlineStartWidth) +
          Number.parseFloat(style.paddingInlineStart) / 2,
        y: rect.top + rect.height / 2,
      };
    },
  );
}
