import { promisify } from 'node:util';
import type { PreviewServer } from 'vite';

export async function stopStaticServer(server: PreviewServer): Promise<void> {
  const close = server.httpServer.close.bind(server.httpServer);

  const closeAsync = promisify(close);

  await closeAsync();
}
