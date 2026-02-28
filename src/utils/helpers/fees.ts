import { Keypair, PublicKey } from '@solana/web3.js';
import { BagsSDK } from '../../client';
import { signAndSendTransaction } from './transaction';

/**
 * Result of claiming fees
 */
export interface ClaimFeesResult {
	/** Transaction signatures for each claim transaction */
	signatures: string[];
}

/**
 * Claims fees for a specific token.
 *
 * @param sdk - The initialized BagsSDK instance
 * @param keypair - The keypair to sign transactions
 * @param tokenMint - The token mint to claim fees from
 * @returns The claim result with transaction signatures
 * @throws Error if no claimable position is found for the token
 *
 * @example
 * ```typescript
 * const result = await claimFees(sdk, keypair, tokenMint);
 * console.log(`Transactions: ${result.signatures.length}`);
 * ```
 */
export async function claimFees(sdk: BagsSDK, keypair: Keypair, tokenMint: PublicKey): Promise<ClaimFeesResult> {
	const connection = sdk.state.getConnection();
	const commitment = sdk.state.getCommitment();
	const wallet = keypair.publicKey;

	const positions = await sdk.fee.getAllClaimablePositions(wallet);

	const position = positions.find((p) => p.baseMint === tokenMint.toBase58());

	if (!position) {
		throw new Error(`No claimable position found for token ${tokenMint.toBase58()}`);
	}

	const transactions = await sdk.fee.getClaimTransaction(wallet, position);
	const signatures: string[] = [];

	for (const transaction of transactions) {
		const signature = await signAndSendTransaction(connection, commitment, transaction, keypair);
		signatures.push(signature);
	}

	return { signatures };
}
