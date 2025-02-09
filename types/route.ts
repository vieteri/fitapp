import { type NextRequest } from 'next/server'

export type RouteHandlerContext<T extends Record<string, string>> = {
  params: T
}

export type DynamicRouteHandler<T extends Record<string, string>> = (
  req: NextRequest,
  context: RouteHandlerContext<T>
) => Promise<Response> 