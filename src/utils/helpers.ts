import { BlockhashWithExpiryBlockHeight, Commitment, Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

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

/**
 * Waits for a specified number of Solana slots to pass.
 * This is different from block height and is necessary for LUT (Lookup Table) operations.
 * @param slotsToPass - Number of slots to wait for
 * @param pollIntervalMs - Polling interval in milliseconds (default: 400ms)
 */
export async function waitForSlotsToPass(connection: Connection, commitment: Commitment, slotsToPass: number = 1, pollIntervalMs: number = 400): Promise<void> {
	try {
		// Get the initial slot
		const initialSlot = await connection.getSlot(commitment);
		const targetSlot = initialSlot + slotsToPass;

		// Poll until target slot is reached
		while (true) {
			const currentSlot = await connection.getSlot(commitment);

			if (currentSlot >= targetSlot) {
				break;
			}

			await sleep(pollIntervalMs);
		}
	} catch (error) {
		console.error('Error waiting for slots to pass:', error);
		// In case of error, fall back to a simple time-based delay
		// Assuming ~400ms per slot on average
		await sleep(slotsToPass * 400);
	}
}

export async function signAndSendTransaction(
	connection: Connection,
	commitment: Commitment,
	transaction: VersionedTransaction,
	keypair: Keypair,
	blockhash?: BlockhashWithExpiryBlockHeight
): Promise<string> {
	transaction.sign([keypair]);

	let finalBlockhash = blockhash;

	if (!blockhash) {
		finalBlockhash = await connection.getLatestBlockhash(commitment);
	} else {
		finalBlockhash = blockhash;
	}

	const signature = await connection.sendTransaction(transaction, {
		skipPreflight: true,
		maxRetries: 0,
	});

	const confirmed = await connection.confirmTransaction(
		{
			blockhash: finalBlockhash.blockhash,
			lastValidBlockHeight: finalBlockhash.lastValidBlockHeight,
			signature: signature,
		},
		commitment
	);

	if (confirmed.value.err) {
		throw new Error(`Transaction failed: ${confirmed.value.err}`);
	}

	console.log('✅ Transaction confirmed:', signature);

	return signature;
}

/**
 * Serializes a Solana versioned transaction to a base64 string compatible with the Bags API.
 * Existing base64 strings are returned unchanged.
 * @param transaction - The versioned transaction instance or pre-serialized base64 string.
 * @returns The base64 encoded transaction string.
 */
export function serializeVersionedTransaction(transaction: VersionedTransaction | string): string {
	if (typeof transaction === 'string') {
		return transaction;
	}

	const serialized = transaction.serialize();

	return Buffer.from(serialized).toString('base64');
}
