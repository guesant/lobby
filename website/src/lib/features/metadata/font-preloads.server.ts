import bodyFont from '../../../assets/fonts/oxanium-latin.woff2';
import headingFont from '../../../assets/fonts/press-start-2p-latin.woff2';
import iconSprite from '../../../assets/icons/pixel-compact.webp';
import { encodeXML } from 'entities';

export function fontPreloads(): string {
  const scenePreload =
    '<link rel="preload" href="/assets/generated/aged-oak.webp" as="image" fetchpriority="high"><link rel="preload" href="/assets/generated/oak-frame.webp" as="image" fetchpriority="high">';

  const iconURL = encodeXML(iconSprite);

  // nosemgrep: html-in-template-string
  const iconSpritePreload = `<link rel="preload" href="${iconURL}" as="image">`;

  const headingURL = encodeXML(headingFont);

  const bodyURL = encodeXML(bodyFont);

  // nosemgrep: html-in-template-string
  return `<link rel="preload" href="${headingURL}" as="font" type="font/woff2" crossorigin="anonymous"><link rel="preload" href="${bodyURL}" as="font" type="font/woff2" crossorigin="anonymous">${scenePreload}${iconSpritePreload}`;
}
