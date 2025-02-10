import type { RouteSuccessResponse } from '../types';

export function createSuccessResponse<T>(data: T): RouteSuccessResponse<T> {
    return { ...data, success: true };
}
