import terminalFont from '../../../assets/fonts/jetbrains-mono-latin.woff2';
import bodyFont from '../../../assets/fonts/oxanium-latin.woff2';
import headingFont from '../../../assets/fonts/press-start-2p-latin.woff2';

export function fontPreloads(interfaceName: string): string {
  if (interfaceName === 'terminal') {
    return `<link rel="preload" href="${terminalFont}" as="font" type="font/woff2" crossorigin="anonymous">`;
  }

  return `<link rel="preload" href="${headingFont}" as="font" type="font/woff2" crossorigin="anonymous"><link rel="preload" href="${bodyFont}" as="font" type="font/woff2" crossorigin="anonymous">`;
}
