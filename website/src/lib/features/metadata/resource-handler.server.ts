import { loadResource } from './load-resource.server.ts';
import type { ResourcePresenter } from './resource.types.ts';
import type { ResourceEvent } from './resource-handler.types.ts';

export async function resourceHandler(
  present: ResourcePresenter,
  contentType: string,
  input: ResourceEvent,
): Promise<Response> {
  const {
    data,
    locale,
    interfaceName
  } = await loadResource(
    input.params.index,
  );

  const body = present(data, locale, interfaceName);

  return Response.json(body, {
    headers: {
      'content-type': contentType,
    },
  });
}
