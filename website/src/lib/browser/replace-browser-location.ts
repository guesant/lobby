export function replaceBrowserLocation(url: URL): void {
  window.location.replace(url.href);
}
