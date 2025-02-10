export function resultSuccess<T>(value: T): { success: true; value: T } {
    return {
        success: true,
        value
    };
}
