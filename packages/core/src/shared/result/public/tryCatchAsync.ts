import type { ResultAsync } from '../types';
import { resultSuccess } from './resultSuccess';
import { resultFromError } from './resultFromError';

export async function tryCatchAsync<T, I>(
    fn: () => Promise<T>,
    input: I
): ResultAsync<T> {
    return fn()
        .then(resultSuccess)
        .catch((e) => {
            return resultFromError(e, input);
        });
}
