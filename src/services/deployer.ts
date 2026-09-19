import { BlockhashWithExpiryBlockHeight, Commitment, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import {
	DeployerClaimableResponseData,
	DeployerClaimTransactionsResponseData,
	DeployerDeferredClaim,
	GetDeployerClaimTransactionsOptions,
} from '../types/deployer';
import bs58 from 'bs58';

export class DeployerService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get a deployer's claimable revenue, separate from its normal recipient allocation.
	 * @param wallet - The deployer wallet to check
	 * @returns Per-token pending/accrued balances plus wallet-wide vault totals
	 */
	async getClaimablePositions(wallet: PublicKey): Promise<DeployerClaimableResponseData> {
		return this.bagsApiClient.get<DeployerClaimableResponseData>('/fee-share/deployer/claimable-positions', {
			params: {
				wallet: wallet.toBase58(),
			},
		});
	}

	/**
	 * Build a bounded batch of sponsored deployer claim transactions.
	 * @param wallet - The deployer wallet that signs and receives claim proceeds
	 * @param options - Optional token filters and response size limit
	 * @returns Deserialized claim transactions plus deferred claims and remaining token mints
	 *
	 * Note: vault sweeps are always wallet-wide; `tokenMints` only filters which pending pool
	 * claims are attempted. Sign and submit the returned transactions in order.
	 */
	async getClaimTransactions(
		wallet: PublicKey,
		options: GetDeployerClaimTransactionsOptions = {}
	): Promise<{
		wallet: string;
		quoteMint: string;
		transactions: Array<{ transaction: VersionedTransaction; blockhash: BlockhashWithExpiryBlockHeight }>;
		remainingTokenMints: string[];
		deferredClaims: DeployerDeferredClaim[];
		transactionVersion: 0;
	}> {
		const response = await this.bagsApiClient.post<DeployerClaimTransactionsResponseData>('/fee-share/deployer/claim-txs', {
			wallet: wallet.toBase58(),
			tokenMints: options.tokenMints?.map((mint) => mint.toBase58()),
			maxTransactions: options.maxTransactions,
		});

		return {
			wallet: response.wallet,
			quoteMint: response.quoteMint,
			transactions: response.transactions.map((tx) => ({
				transaction: VersionedTransaction.deserialize(bs58.decode(tx.transaction)),
				blockhash: tx.blockhash,
			})),
			remainingTokenMints: response.remainingTokenMints,
			deferredClaims: response.deferredClaims,
			transactionVersion: response.transactionVersion,
		};
	}
}
