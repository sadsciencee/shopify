export function resultFromError<I>(
	error: unknown,
	input: I,
): {
	success: false;
	errorType: 'error';
	error: Error;
	input: I;
} {
	if (error instanceof Error) {
		console.error(`error: ${error.message}`);
		return {
			success: false,
			errorType: 'error',
			error,
			input,
		};
	} else {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.error(`unknown: ${error}`);
		return {
			success: false,
			errorType: 'error',
			error: new Error('unknown error'),
			input,
		};
	}
}
