import { BlockhashWithExpiryBlockHeight, Commitment, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import { deriveBagsFeeShareV2PartnerConfigPda, fetchBagsFeeShareV2PartnerConfig } from '../utils/fee-share-v2/partner-config';
import { DecodedPartnerConfig } from '../types/fee-share-v2';
import { PartnerConfigClaimStatsResponse, TransactionWithBlockhash } from '../types';
import bs58 from 'bs58';

export class PartnerService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get the partner config for a partner
	 * @param wallet - The wallet of the partner
	 * @returns The decoded partner config account
	 */
	async getPartnerConfig(wallet: PublicKey): Promise<DecodedPartnerConfig> {
		const partnerConfig = deriveBagsFeeShareV2PartnerConfigPda(wallet);
		const partnerConfigData = await fetchBagsFeeShareV2PartnerConfig(partnerConfig, this.connection, this.commitment, this.bagsFeeShareV2Coder);

		if (!partnerConfigData) {
			throw new Error('Partner config not found');
		}

		return partnerConfigData;
	}

	/**
	 * Get the partner config creation transaction for a partner
	 * @param partner - The wallet of the partner
	 * @returns The partner config creation transaction and blockhash
	 */
	async getPartnerConfigCreationTransaction(partner: PublicKey): Promise<{ transaction: VersionedTransaction; blockhash: BlockhashWithExpiryBlockHeight }> {
		const response = await this.bagsApiClient.post<{ transaction: TransactionWithBlockhash }>('/fee-share/partner-config/creation-tx', {
			partnerWallet: partner.toBase58(),
		});

		const decodedTransaction = bs58.decode(response.transaction.transaction);
		const transaction = VersionedTransaction.deserialize(decodedTransaction);

		return {
			transaction,
			blockhash: response.transaction.blockhash,
		};
	}

	/**
	 * Get the partner config claim stats for a partner
	 * @param partner - The wallet of the partner
	 * @returns The partner config claim stats
	 */
	async getPartnerConfigClaimStats(partner: PublicKey): Promise<PartnerConfigClaimStatsResponse> {
		const response = await this.bagsApiClient.get<PartnerConfigClaimStatsResponse>('/fee-share/partner-config/stats', {
			params: {
				partner: partner.toBase58(),
			},
		});

		return {
			claimedFees: response.claimedFees,
			unclaimedFees: response.unclaimedFees,
		};
	}

	/**
	 * Get the partner config claim transactions for a partner.
	 *
	 * @param partner - The wallet of the partner
	 * @returns The partner config claim transactions and blockhashes
	 *
	 * Note: The returned array of transactions should be handled as follows:
	 *   - The last transaction in the array must be executed last, as it claims the SOL from the user vault.
	 *   - All other transactions (if present) can be processed in parallel or any order before the last one.
	 */
	async getPartnerConfigClaimTransactions(partner: PublicKey): Promise<Array<{ transaction: VersionedTransaction; blockhash: BlockhashWithExpiryBlockHeight }>> {
		const response = await this.bagsApiClient.post<{ transactions: Array<TransactionWithBlockhash> }>('/fee-share/partner-config/claim-tx', {
			partnerWallet: partner.toBase58(),
		});

		const deserializedTransactionsWithBlockhash = response.transactions.map((tx) => {
			const decodedTransaction = bs58.decode(tx.transaction);

			return {
				transaction: VersionedTransaction.deserialize(decodedTransaction),
				blockhash: tx.blockhash,
			};
		});

		return deserializedTransactionsWithBlockhash;
	}
}
