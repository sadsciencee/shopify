export function resultErrorFromMessage<T>(message: string, input: T) {
    return {
        success: false,
        error: new Error(message),
        input: input
    };
}
