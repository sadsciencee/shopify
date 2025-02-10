import type { SerializeFrom } from '@remix-run/cloudflare';
import type { RouteErrorResponse, RouteResponse } from '../types';

export function isError<T>(
    response: SerializeFrom<RouteResponse<T>>
): response is RouteErrorResponse {
    return !response.success;
}
