import { startStaticServer } from './static-server/start-static-server.ts';
import { stopStaticServer } from './static-server/stop-static-server.ts';

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
