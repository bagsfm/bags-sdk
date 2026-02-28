import { BlockhashWithExpiryBlockHeight, Commitment, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import { TransactionWithBlockhash, TransferFeeShareAdminParams, UpdateFeeShareConfigParams } from '../types';
import { BAGS_FEE_SHARE_ADMIN_MAX_CLAIMERS_NON_LUT } from '../constants';
import { ConfigService } from './config';
import bs58 from 'bs58';

export class FeeShareAdminService extends BaseService {
	private configService: ConfigService;

	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
		this.configService = new ConfigService(apiKey, connection, commitment);
	}

	/**
	 * Get the list of token mints where the given wallet is the fee share admin
	 * @param wallet - The wallet to check admin status for
	 * @returns Array of token mint public keys where the wallet is the fee share admin
	 */
	async getAdminTokenMints(wallet: PublicKey): Promise<string[]> {
		const response = await this.bagsApiClient.get<{ tokenMints: string[] }>('/fee-share/admin/list', {
			params: {
				wallet: wallet.toBase58(),
			},
		});

		return response.tokenMints;
	}

	/**
	 * Get a transaction to transfer fee share admin authority to a new admin
	 * @param params - The transfer parameters
	 * @returns The transfer admin transaction and blockhash
	 */
	async getTransferAdminTransaction(params: TransferFeeShareAdminParams): Promise<{ transaction: VersionedTransaction; blockhash: BlockhashWithExpiryBlockHeight }> {
		const response = await this.bagsApiClient.post<{ transaction: TransactionWithBlockhash }>('/fee-share/admin/transfer-tx', {
			baseMint: params.baseMint.toBase58(),
			currentAdmin: params.currentAdmin.toBase58(),
			newAdmin: params.newAdmin.toBase58(),
			payer: params.payer.toBase58(),
		});

		const decodedTransaction = bs58.decode(response.transaction.transaction);
		const transaction = VersionedTransaction.deserialize(decodedTransaction);

		return {
			transaction,
			blockhash: response.transaction.blockhash,
		};
	}

	/**
	 * Get lookup table creation transactions for an admin config update when there are more than 7 fee claimers.
	 *
	 * @param params - The update config parameters (only feeClaimers and payer are used)
	 * @returns The LUT creation and extend transactions, or null if a LUT is not needed
	 */
	async getUpdateConfigLookupTableTransactions(params: Pick<UpdateFeeShareConfigParams, 'feeClaimers' | 'payer'>) {
		return this.configService.getConfigCreationLookupTableTransactions(params, undefined, BAGS_FEE_SHARE_ADMIN_MAX_CLAIMERS_NON_LUT);
	}

	/**
	 * Get transactions to update the fee share configuration for a token.
	 *
	 * @param params - The update config parameters
	 * @returns The update config transactions and blockhashes
	 *
	 * Note: The returned transactions must be signed and sent in order.
	 * When there are more than 7 fee claimers, additionalLookupTables is required.
	 * Use getUpdateConfigLookupTableTransactions to create the necessary LUT first.
	 */
	async getUpdateConfigTransactions(params: UpdateFeeShareConfigParams): Promise<Array<{ transaction: VersionedTransaction; blockhash: BlockhashWithExpiryBlockHeight }>> {
		const response = await this.bagsApiClient.post<{ transactions: Array<TransactionWithBlockhash> }>('/fee-share/admin/update-config', {
			baseMint: params.baseMint.toBase58(),
			basisPointsArray: params.feeClaimers.map((claimer) => claimer.userBps),
			claimersArray: params.feeClaimers.map((claimer) => claimer.user.toBase58()),
			payer: params.payer.toBase58(),
			additionalLookupTables: params.additionalLookupTables?.map((table) => table.toBase58()),
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
