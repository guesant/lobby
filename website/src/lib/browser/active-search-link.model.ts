export function activeSearchLink(links: HTMLAnchorElement[]): number {
  let active = -1;

  for (let index = 0; index < links.length; index += 1) {
    if (links[index] === document.activeElement) {
      active = index;
      break;
    }
  }

  return active;
}
