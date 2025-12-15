export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

export function chunkArray<T>(array: Array<T>, size: number): Array<Array<T>> {
	const result = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
}
