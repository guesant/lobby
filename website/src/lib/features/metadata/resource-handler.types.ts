import type { RequestHandler } from '@sveltejs/kit';

export type ResourceEvent = Parameters<
  RequestHandler<{
    index: string;
  }>
>[0];
