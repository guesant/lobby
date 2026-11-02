import type { SiteData } from './content.types.ts';
import { validateSiteDocuments } from './documents.validation.ts';
import {
  type FederationStatus,
  federationStatuses,
} from './federation-status.model.ts';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';

const siteCache = new Map<
  string,
  {
    signature: string;
    data: SiteData;
  }
>();

async function inputSignature(root: string): Promise<string> {
  const files = [
    'src/data/links.yaml',
    'src/data/editorial.yaml',
    'src/data/credits.yaml',
    'src/data/statistics.yaml',
    '../.cache/federation/assets/federation.json',
  ];

  const versions = await Promise.all(
    files.map(async (file): Promise<string> => {
      try {
        const metadata = await stat(resolve(root, file), {
          bigint: true,
        });

        return `${file}:${String(metadata.size)}:${String(metadata.mtimeNs)}`;
      } catch (error) {
        if (
          file.endsWith('federation.json') &&
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          return `${file}:missing`;
        }

        throw error;
      }
    }),
  );

  return versions.join('|');
}

export async function getFederationStatus(
  websiteRoot: string = process.cwd(),
): Promise<FederationStatus[]> {
  try {
    const value: unknown = JSON.parse(
      await readFile(
        resolve(websiteRoot, '../.cache/federation/assets/status.json'),
        'utf8',
      ),
    );

    return federationStatuses(value);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function readYaml(root: string, name: string): Promise<unknown> {
  return parse(
    await readFile(resolve(root, `src/data/${name}.yaml`), 'utf8'),
  ) as unknown;
}

async function readDocuments(root: string): Promise<SiteData> {
  const [
    links,
    editorial,
    credits,
    statistics,
  ] = await Promise.all(
    [
      'links',
      'editorial',
      'credits',
      'statistics',
    ].map((name): Promise<unknown> => {
      return readYaml(root, name);
    }),
  );

  return validateSiteDocuments({
    links,
    editorial,
    credits,
    statistics,
    federation: await readFederation(root),
  });
}

async function readFederation(root: string): Promise<unknown> {
  try {
    return JSON.parse(
      await readFile(
        resolve(root, '../.cache/federation/assets/federation.json'),
        'utf8',
      ),
    ) as unknown;
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      throw error;
    }

    return {
      version: 1,
      items: [],
    };
  }
}

export async function getSiteData(
  websiteRoot: string = process.cwd(),
): Promise<SiteData> {
  websiteRoot = resolve(websiteRoot);

  const signature = await inputSignature(websiteRoot);

  const cached = siteCache.get(websiteRoot);

  if (cached?.signature === signature) {
    return cached.data;
  }

  const data = await readDocuments(websiteRoot);

  siteCache.set(websiteRoot, {
    signature,
    data,
  });

  return data;
}
