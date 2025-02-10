import type { JsonifyObject } from 'type-fest/source/jsonify';

export function unwrap<T extends object>(wrapped: JsonifyObject<T>): T {
    return wrapped as T;
}
