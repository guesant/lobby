export function updateVisibility(): void {
  document.documentElement.dataset['pageHidden'] = String(document.hidden);
}
