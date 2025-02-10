import type { Result } from '../types';
import { resultSuccess } from './resultSuccess';
import { resultFromError } from './resultFromError';

export function tryCatch<T, I>(fn: () => T, input: I): Result<T> {
    try {
        return resultSuccess(fn());
    } catch (e) {
        return resultFromError(e, input);
    }
}
