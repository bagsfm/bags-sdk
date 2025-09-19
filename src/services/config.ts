import { Commitment, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import { getExistingConfig } from '../utils/config';
import { FeeShareTransactionConfigApiResponse, TransactionConfigApiResponse, TransactionTipConfig } from '../types/api';
import { CreateFeeShareConfigParams, CreateFeeShareConfigResponse, GetOrCreateConfigResponse } from '../types/token-launch';
import bs58 from 'bs58';
import { WRAPPED_SOL_MINT } from '../constants';
import { sortKeys } from '../utils/fee-share';

export class ConfigService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get config creation transaction or config
	 *
	 * @param wallet The wallet to get the config creation transaction or config for
	 * @param tipConfig Optional tip config to use for the config creation transaction
	 * @returns either the config creation transaction or the config
	 */
	async getOrCreateConfig(wallet: PublicKey, tipConfig?: TransactionTipConfig): Promise<GetOrCreateConfigResponse> {
		const existingConfig = await getExistingConfig(wallet, this.connection, this.commitment);

		if (existingConfig != null) {
			return {
				configKey: existingConfig,
				transaction: null,
			};
		}

		const response = await this.bagsApiClient.post<TransactionConfigApiResponse>('/token-launch/create-config', {
			launchWallet: wallet.toBase58(),
			tipWallet: tipConfig ? tipConfig.tipWallet.toBase58() : undefined,
			tipLamports: tipConfig ? tipConfig.tipLamports : undefined,
		});

		if (response.tx == null) {
			return {
				configKey: new PublicKey(response.configKey),
				transaction: null,
			};
		} else {
			const decodedTransaction = bs58.decode(response.tx);
			const transaction = VersionedTransaction.deserialize(decodedTransaction);

			return {
				transaction,
				configKey: new PublicKey(response.configKey),
			};
		}
	}

	/**
	 * Get config creation transaction with shared fees
	 *
	 * @param params The parameters for creating a fee share config
	 * @returns The config creation transaction and config key
	 */

	async createFeeShareConfig(params: CreateFeeShareConfigParams): Promise<CreateFeeShareConfigResponse> {
		if (params.users.length !== 2) {
			throw new Error('Only exactly 2 users are supported');
		}

		if (params.users.reduce((acc, user) => acc + user.bps, 0) !== 10000) {
			throw new Error('Users basis points must sum to 10000');
		}

		if (params.quoteMint.toBase58() != WRAPPED_SOL_MINT.toBase58()) {
			throw new Error('Non-wSOL quote mint not supported');
		}

		if (!params.baseMint.toBase58().endsWith('BAGS')) {
			throw new Error('Non-BAGS base mint not supported');
		}

		const sortedKeys = sortKeys(params.users[0].wallet, params.users[1].wallet);

		const walletA = sortedKeys.sortedA;
		const walletB = sortedKeys.sortedB;

		const walletABps = params.users.find((user) => user.wallet.toBase58() === walletA.toBase58()).bps;
		const walletBBps = params.users.find((user) => user.wallet.toBase58() === walletB.toBase58()).bps;

		const response = await this.bagsApiClient.post<FeeShareTransactionConfigApiResponse>('/token-launch/fee-share/create-config', {
			walletA: walletA.toBase58(),
			walletB: walletB.toBase58(),
			walletABps: walletABps,
			walletBBps: walletBBps,
			payer: params.payer.toBase58(),
			baseMint: params.baseMint.toBase58(),
			quoteMint: params.quoteMint.toBase58(),
			tipWallet: params.tipConfig ? params.tipConfig.tipWallet.toBase58() : undefined,
			tipLamports: params.tipConfig ? params.tipConfig.tipLamports : undefined,
		});

		const decodedTransaction = bs58.decode(response.tx);
		const transaction = VersionedTransaction.deserialize(decodedTransaction);

		return {
			transaction,
			configKey: new PublicKey(response.configKey),
		};
	}
}
