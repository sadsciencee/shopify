import {useCallback, useMemo, useState} from 'react';
import type {DisplayableError} from '@admin';
import {ResultAsync} from 'neverthrow'
import {type JsonValue} from "type-fest";

export function useDirectAccess<T>() {
    const [queryHistory, setQueryHistory] = useState<string[]>([]);
    const [queryCache, setQueryCache] = useState<{
        query: string | null | undefined;
        results: Record<string, T | undefined>;
        loading: boolean;
        error: Error | DisplayableError[] | undefined;
    }>(defaultQueryState);

    const executeQuery = useCallback(async (options: DirectAccessArgs) => {
        let fromCache = false;
        const key = createCacheKey(options.variables ?? "___default___");
        setQueryHistory((prev) => [...prev, key]);
        setQueryCache((prev) => {
            if (prev.results[key] !== undefined) {
                fromCache = true;
                return {
                    ...prev,
                    query: key,
                    results: prev.results,
                };
            }
            const newResults = {...prev.results, [key]: undefined};
            return {...prev, query: key, results: newResults};
        });
        if (fromCache) return;
        return await directAccess<T>(options).match((value: T) =>  {
                setQueryCache((prev) => {
                    const newResults = {...prev.results, [key]: value};
                    return {...prev, loading: false, results: newResults};
                });
            },
            (error: Error | DisplayableError[]) => {
                setQueryCache((prev) => ({
                    ...prev,
                    loading: false,
                    error,
                }));
            }
        );
    }, []);

    const getLatestResolvedQuery = useMemo(() => {
        for (let i = queryHistory.length - 1; i >= 0; i--) {
            const key = queryHistory[i];
            if (queryCache.results[key] !== undefined) {
                return {
                    value: queryCache.results[key],
                    loading: false,
                    error: undefined,
                };
            }
        }
        return {
            value: undefined,
            loading: true,
            error: undefined,
        };
    }, [queryHistory, queryCache]);

    const resetQueryCache = useCallback(() => {
        setQueryCache(defaultQueryState);
        setQueryHistory([]);
    }, []);

    return {executeQuery, resetQueryCache, ...getLatestResolvedQuery};
}

const defaultQueryState = {
    query: "___default___",
    results: {___default___: undefined},
    loading: true,
    error: undefined,
}

type DirectAccessArgs = {
    query: string;
    variables?: JsonValue;
};
const DIRECT_ACCESS_URL = "shopify:admin/api/graphql.json";

function directAccess<T>({query, variables}: DirectAccessArgs): ResultAsync<T, Error> {
    const body = variables ? {query, variables} : {query}
    return ResultAsync.fromPromise(
        fetch(DIRECT_ACCESS_URL, {
            method: "POST",
            body: JSON.stringify(body),
        }).then(response => {
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return response.json();
        }),
        (e) => {
            console.log('Error calling the direct access api with variables:', variables);
            console.error(e);
            return e as Error;
        }
    );
}

function createCacheKey(obj: JsonValue) {
    const jsonString = JSON.stringify(obj);
    return jsonString.replace(/[^a-zA-Z]/g, "");
}
