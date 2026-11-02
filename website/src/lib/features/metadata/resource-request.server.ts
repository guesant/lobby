import type { ResourcePresenter } from './resource.types.ts';
import { resourceHandler } from './resource-handler.server.ts';
import type { RequestHandler } from '@sveltejs/kit';

export function resourceRequest(
  present: ResourcePresenter,
  contentType = 'application/json',
): RequestHandler<{
  index: string;
}> {
  return resourceHandler.bind(null, present, contentType);
}
