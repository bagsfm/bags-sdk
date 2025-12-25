import { Commitment, Connection } from '@solana/web3.js';
import { sleep } from './common';

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
