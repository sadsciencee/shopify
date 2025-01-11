export type RouteErrorResponse = {
    success: false;
    message: string;
};

export type RouteSuccessResponse<T> = T & {
    success: true;
};

export type RouteResponse<T> = RouteErrorResponse | RouteSuccessResponse<T>;

export interface PayloadRegistry {}

declare global {
    interface PayloadRegistry {
        'close': { success?: boolean, message?: string };
        'toast': { success: boolean, message: string };
    }
}

export type PayloadKey = keyof PayloadRegistry;
export type PayloadData<K extends PayloadKey> = PayloadRegistry[K];

export interface Message<K extends PayloadKey> {
    type: K;
    modalId: string;
    data: PayloadData<K>;
}
