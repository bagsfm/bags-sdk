import { BlockhashWithExpiryBlockHeight, Commitment, Connection, Keypair, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { JITO_TIP_ACCOUNTS } from '../constants';
import { JitoRegion } from '../types';
import { BagsSDK } from '../client';

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
 * Serializes a Solana versioned transaction to a base58 string compatible with the Bags API.
 * Existing base58 strings are returned unchanged.
 * @param transaction - The versioned transaction instance or pre-serialized base58 string.
 * @returns The base58 encoded transaction string.
 */
export function serializeVersionedTransaction(transaction: VersionedTransaction | string): string {
	if (typeof transaction === 'string') {
		// Validate if the transaction is a valid base58 string
		if (!bs58.decodeUnsafe(transaction)) {
			throw new Error('Invalid base58 string');
		}

		return transaction;
	}

	const serialized = transaction.serialize();

	return bs58.encode(serialized);
}

/**
 * Builds a tip transaction message ready for signing. Defaults to using a random Jito
 * tip account, but callers can provide any compatible tip destination.
 * @param connection - The connection to use to get the latest blockhash
 * @param commitment - The commitment to use for the transaction
 * @param payer - The payer of the transaction
 * @param tipLamports - The amount of lamports to tip
 * @param options (optional) - The options for the tip transaction
 * @returns The tip transaction
 */
export async function createTipTransaction(
	connection: Connection,
	commitment: Commitment,
	payer: PublicKey,
	tipLamports: number,
	options: {
		tipAccount?: PublicKey;
		blockhash?: string;
	} = {}
): Promise<VersionedTransaction> {
	if (tipLamports <= 0) {
		throw new Error('Tip lamports must be greater than zero.');
	}

	const availableTipAccounts = JITO_TIP_ACCOUNTS;
	const tipAccount = options.tipAccount ?? availableTipAccounts[Math.floor(Math.random() * availableTipAccounts.length)];

	if (!tipAccount) {
		throw new Error('No tip account provided and no default tip accounts available.');
	}

	const recentBlockhash = options.blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

	const tipInstruction = SystemProgram.transfer({
		fromPubkey: payer,
		toPubkey: tipAccount,
		lamports: tipLamports,
	});

	const transactionMessage = new TransactionMessage({
		payerKey: payer,
		recentBlockhash,
		instructions: [tipInstruction],
	}).compileToV0Message();

	return new VersionedTransaction(transactionMessage);
}

/**
 * Send a bundle and wait for confirmation
 * @param signedTransactions - Array of signed VersionedTransaction instances
 * @param sdk - The Bags SDK instance
 * @param region - Jito region to send the bundle to
 * @returns The successfully confirmed bundle ID
 */
export async function sendBundleAndConfirm(signedTransactions: VersionedTransaction[], sdk: BagsSDK, region: JitoRegion = 'mainnet'): Promise<string> {
	const bundleId = await sdk.solana.sendBundle(signedTransactions, region);

	const maxRetries = 10;
	const retryDelayMs = 500;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		const statusResponse = await sdk.solana.getBundleStatuses([bundleId], region);

		if (statusResponse?.value?.length && statusResponse.value[0] != null) {
			const bundleStatus = statusResponse.value[0];
			const { confirmation_status, err, transactions } = bundleStatus;

			if (confirmation_status === 'confirmed' || confirmation_status === 'finalized') {
				// Check for bundle errors
				const isSuccess = err == null || err.Ok == null;

				if (!isSuccess) {
					throw new Error('Bundle transactions failed with error');
				}

				if (!transactions?.length) {
					throw new Error('Bundle confirmed but no transactions found');
				}

				return bundleId;
			}
		}

		await sleep(retryDelayMs);
	}

	throw new Error(`Bundle confirmation timed out after ${maxRetries} attempts`);
}
