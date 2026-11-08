export function visibleLanes(content: HTMLElement): Map<HTMLElement, number> {
  const lanes = new Map<HTMLElement, number>();

  for (const body of content.querySelectorAll<HTMLElement>(
    '.suspension-body',
  )) {
    if (body.getClientRects().length) {
      const bounds = body.getBoundingClientRect();

      lanes.set(body, bounds.top);
    }
  }

  return lanes;
}
