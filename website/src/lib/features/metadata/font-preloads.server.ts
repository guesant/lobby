import terminalFont from '../../../assets/fonts/jetbrains-mono-latin.woff2';
import bodyFont from '../../../assets/fonts/oxanium-latin.woff2';
import headingFont from '../../../assets/fonts/press-start-2p-latin.woff2';
import iconSprite from '../../../assets/icons/pixel-compact.png';

export function fontPreloads(interfaceName: string): string {
  if (interfaceName === 'terminal') {
    return `<link rel="preload" href="${terminalFont}" as="font" type="font/woff2" crossorigin="anonymous">`;
  }

  const scenePreload =
    '<link rel="preload" href="/assets/generated/aged-oak.webp" as="image" fetchpriority="high">';

  const iconSpritePreload = `<link rel="preload" href="${iconSprite}" as="image" fetchpriority="high">`;

  return `<link rel="preload" href="${headingFont}" as="font" type="font/woff2" crossorigin="anonymous"><link rel="preload" href="${bodyFont}" as="font" type="font/woff2" crossorigin="anonymous">${scenePreload}${iconSpritePreload}`;
}
