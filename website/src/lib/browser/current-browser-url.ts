export function currentBrowserURL(): URL {
  return new URL(window.location.href);
}
