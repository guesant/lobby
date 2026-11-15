export function quickHomeShortcutIsValid(): boolean {
  const quickContacts = document.querySelector<HTMLElement>('.quick-contacts');

  if (quickContacts === null) {
    return false;
  }

  const quickHome = quickContacts.querySelector<HTMLAnchorElement>(
    '.quick-contact-home',
  );

  const quickEmail = quickContacts.querySelector<HTMLAnchorElement>(
    '[data-platform="email"]',
  );

  if (quickHome === null || quickEmail === null) {
    return false;
  }

  const locale = location.pathname.split('/')[1] ?? '';

  const conditions = [
    quickContacts.children.length === 9,
    quickContacts.firstElementChild === quickHome,
    (quickHome.compareDocumentPosition(quickEmail) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
      0,
    new URL(quickHome.href).pathname === `/${locale}/`,
    (quickHome.getAttribute('aria-label')?.length ?? 0) > 0,
  ];

  return conditions.every(Boolean);
}
