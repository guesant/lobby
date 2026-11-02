import { resolveDestination } from '../content/content.model.ts';
import {
  type LinkDocument,
  type LinkRecord,
} from '../content/content.types.ts';

export function currentPage(active: boolean): 'page' | undefined {
  if (active) {
    return 'page';
  }

  return undefined;
}

export function enabledAttribute(enabled: boolean): true | undefined {
  if (enabled) {
    return true;
  }

  return undefined;
}

export function emptyAttribute(enabled: boolean): '' | undefined {
  if (enabled) {
    return '';
  }

  return undefined;
}

export function profileInitials(name: string): string {
  const parts: string[] = name.trim()
    .split(/\s+/);

  const first: string = parts[0]?.[0] ?? '';

  if (parts.length < 2) {
    return first;
  }

  return `${first}${parts.at(-1)?.[0] ?? ''}`;
}

export function destinationFor(
  context: {
    config: Pick<LinkDocument, 'site'>;
    locale: string;
    interfaceName: 'minecraft' | 'terminal';
    origin?: string;
  },
  item: Pick<LinkRecord, 'url' | 'target'>,
): {
  href: string;
  external: boolean;
  thirdParty: boolean;
  target: string;
  rel?: string;
  display: string;
} {
  const destination = resolveDestination(
    context.config.site,
    item,
    context.origin,
  );

  let href = destination.href;

  if (!destination.external && context.interfaceName === 'terminal') {
    const prefix = `/${context.locale}/`;

    if (href.startsWith(prefix) && !href.startsWith(`${prefix}terminal/`)) {
      const suffix = href.slice(prefix.length);

      function resolveTerminalSuffix(): string {
        if (suffix === 'agora/') {
          return 'now/';
        }

        return suffix;
      }

      href = `${prefix}terminal/${resolveTerminalSuffix()}`;
    }
  }

  return {
    ...destination,
    href,
  };
}
