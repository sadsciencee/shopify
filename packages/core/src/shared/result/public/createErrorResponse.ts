import type { RouteErrorResponse } from "../types";

export function createErrorResponse(
    message: string | Error | unknown,
): RouteErrorResponse {
    if (typeof message === "string") {
        return { success: false, message };
    }
    if (message instanceof Error) {
        return { success: false, message: message.message };
    }
    return { success: false, message: JSON.stringify(message) };
}
