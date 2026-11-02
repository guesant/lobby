import { getSiteData } from '../content/content.server.ts';
import type { TerminalEntry } from './entries.types.ts';
import { terminalPaths } from './terminal-paths.server.ts';

export async function terminalEntries(): Promise<TerminalEntry[]> {
  const data = await getSiteData();

  const entries: TerminalEntry[] = [];

  for (const language of data.links.language_options) {
    const paths = terminalPaths(data, language);

    entries.push(...paths);
  }

  return entries;
}
