import { resolve } from 'node:path';
import { preview, type PreviewServer } from 'vite';

export async function startStaticServer(
  directory: string,
  host = '127.0.0.1',
): Promise<PreviewServer> {
  const outputDirectory = resolve(directory);

  return preview({
    configFile: false,
    appType: 'mpa',
    logLevel: 'error',
    build: {
      outDir: outputDirectory,
    },
    preview: {
      host,
      port: 4173,
      strictPort: true,
    },
  });
}
