import type { DisplayableError } from '../../../admin.types';

export function resultFromShopifyError<I>(
    error: DisplayableError[],
    input: I
): {
    success: false;
    error: DisplayableError[];
    input: I;
} {
    return {
        success: false,
        error,
        input
    };
}
