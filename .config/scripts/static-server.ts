import { resolve } from 'node:path';
import { preview, type PreviewServer } from 'vite';

async function startStaticServer(
  directory: string,
  host = '127.0.0.1',
): Promise<PreviewServer> {
  return preview({
    configFile: false,
    appType: 'mpa',
    logLevel: 'error',
    build: {
      outDir: resolve(directory),
    },
    preview: {
      host,
      port: 4173,
      strictPort: true,
    },
  });
}

async function stopStaticServer(server: PreviewServer): Promise<void> {
  return new Promise((accept, reject): void => {
    server.httpServer.close((error): void => {
      if (error) {
        reject(error);

        return;
      }

      accept();
    });
  });
}

export async function withStaticServer(
  task: () => Promise<void>,
  directory = '.local/build/qa',
): Promise<void> {
  const server = await startStaticServer(directory);

  try {
    await task();
  } finally {
    await stopStaticServer(server);
  }
}

if (import.meta.main) {
  await startStaticServer('.local/build/site', '0.0.0.0');
}
