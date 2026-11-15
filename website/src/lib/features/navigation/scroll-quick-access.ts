import type { AfterNavigate } from '$app/navigation';

export function scrollQuickAccess(navigation: AfterNavigate): void {
  if (navigation.type !== 'link') {
    return;
  }

  const {
    from,
    to,
  } = navigation;

  if (!from || !to || to.url.hash || from.url.pathname === to.url.pathname) {
    return;
  }

  const quickAccess = document.getElementById('profile-quick-access-title');

  if (!quickAccess) {
    return;
  }

  quickAccess.scrollIntoView({
    block: 'start',
    behavior: 'instant',
  });
}
