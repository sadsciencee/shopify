import { useEffect, useState } from 'react';
import type { FetcherWithComponents } from '@remix-run/react';

export type FetcherResult = {
	success: boolean;
	message: string;
}

type UseFetcherResultArgs<T extends FetcherResult> = {
	fetcher: FetcherWithComponents<T>;
	afterSuccess?: (data: T) => void;
	afterError?: () => void;
	onSubmitStart?: () => void;
	onSubmitComplete?: () => void;
};

export function useFetcherResult<T extends FetcherResult>({
	fetcher,
	afterSuccess,
	afterError,
	onSubmitStart,
	onSubmitComplete,
}: UseFetcherResultArgs<T>) {
	const [hasHandledResponse, setHasHandledResponse] = useState(false);

	useEffect(() => {
		if (fetcher.state === 'submitting') {
			onSubmitStart?.();
			setHasHandledResponse(false);
		}

		if (fetcher.state === 'idle' && fetcher.data && !hasHandledResponse) {
			const { success } = fetcher.data;
			if (success) {
				afterSuccess?.(fetcher.data);
			} else {
				afterError?.();
			}
			onSubmitComplete?.();
			setHasHandledResponse(true);
		}
	}, [fetcher.state, fetcher.data, hasHandledResponse]);
}
