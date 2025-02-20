export function filterMap<T, U>(
	arr: T[],
	fn: (item: T) => U | null | undefined,
): U[] {
	return arr.reduce<U[]>((acc, item) => {
		const result = fn(item);
		if (result !== null && result !== undefined) {
			acc.push(result);
		}
		return acc;
	}, []);
}
