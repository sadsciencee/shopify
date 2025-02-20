import { useCallback, useMemo, useState } from 'react';
import { type ResultAsync, resultFromError, resultSuccess } from '../../../shared/result';
import { type JsonValue } from '../../../shared/jsonValue';
import type { DisplayableError } from '@admin'

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
		const key = createCacheKey(options.variables ?? '___default___');
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
			const newResults = { ...prev.results, [key]: undefined };
			return { ...prev, query: key, results: newResults };
		});
		if (fromCache) return;
		const result = await directAccess<T>(options);
		if (!result.success) {
			console.error(result.error);
			setQueryCache((prev) => ({
				...prev,
				loading: false,
				error: result.error,
			}));
			return;
		}
		setQueryCache((prev) => {
			const newResults = { ...prev.results, [key]: result.value };
			return { ...prev, loading: false, results: newResults };
		});
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

	return { executeQuery, resetQueryCache, ...getLatestResolvedQuery };
}

const defaultQueryState = {
	query: '___default___',
	results: { ___default___: undefined },
	loading: true,
	error: undefined,
};

type DirectAccessArgs = {
	query: string;
	variables?: JsonValue;
	url?: string;
};
export async function directAccess<T>({
	query,
	variables,
	url = 'shopify:admin/api/2025-01/graphql.json',
}: DirectAccessArgs): ResultAsync<T> {
	try {
		if (!variables) {
			const res = await fetch(url, {
				method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
				body: JSON.stringify({
					query,
				}),
			});
			const { data }: { data: T } = await res.json();
			return resultSuccess(data);
		}
		const res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				query,
				variables,
			}),
		});
		if (!res.ok) {
			return resultFromError(new Error(`Failed to fetch data: ${res.statusText}`), {
				query,
				variables,
			});
		}
		const { data }: { data: T } = await res.json();
		return resultSuccess(data);
	} catch (e) {
		console.error(e);
		return resultFromError(e, { query, variables });
	}
}

function createCacheKey(obj: JsonValue) {
	const jsonString = JSON.stringify(obj);
	return jsonString.replace(/[^a-zA-Z]/g, '');
}
