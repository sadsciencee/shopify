import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loaderHandler({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";

    return {
        query,
        timestamp: new Date().toISOString(),
    };
}
