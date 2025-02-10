import { type DisplayableError } from '@admin';

export type ShopifyGraphqlErrors = DisplayableError[];

export type Result<T> =
    | {
    success: true;
    value: T;
}
    | {
    success: false;
    error: Error | DisplayableError[];
    input: unknown;
};

export type ClientResult<T> =
    | {
    value: T;
    loading: false;
    error: undefined;
}
    | {
    value: undefined;
    error: Error | DisplayableError[];
    loading: false;
}
    | {
    value: undefined;
    loading: true;
    error: undefined;
}
    | {
    value: T;
    loading: true;
    error: undefined;
}
    | {
    value: undefined;
    loading: false;
    error: undefined;
};

export type ResultAsync<T> = Promise<Result<T>>;

export type RouteErrorResponse = {
    success: false;
    message: string;
};

export type RouteSuccessResponse<T> = T & {
    success: true;
};

export type RouteResponse<T> = RouteErrorResponse | RouteSuccessResponse<T>;

export type RouteCountainerProps<L, A> = {
    loaderData: L;
    actionData: A | undefined;
};
