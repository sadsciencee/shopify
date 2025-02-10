import type { Result } from '../types';

export function expectResult<T>(result: Result<T>): T {
    if (result.success) {
        return result.value;
    } else {
        throw result.error;
    }
}
