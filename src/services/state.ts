import { type Commitment, type Connection, PublicKey } from '@solana/web3.js';
import type {
	BagsGetFeeShareWalletV2BulkResponseItem,
	BagsGetFeeShareWalletV2BulkStateItem,
	BagsGetFeeShareWalletV2Response,
	BagsGetFeeShareWalletV2State,
	GetLaunchWalletV2BulkRequestItem,
	GetPoolConfigKeyByFeeClaimerVaultApiResponse,
	GetTokenClaimEventsSuccessResponse,
	GetTokenClaimStatsV2Response,
	SupportedSocialProvider,
	TokenClaimEvent,
	TokenLaunchCreator,
	TokenLaunchCreatorV3WithClaimStats,
} from '../types/api';
import type { BorshAccountsCoder, Program } from '@coral-xyz/anchor';
import type { BagsFeeShare as BagsFeeShareIDL } from '../idl/fee-share-v2/idl';
import type { DynamicBondingCurve as DynamicBondingCurveIDL } from '../idl/dynamic-bonding-curve/idl';
import type { DammV2 as DammV2IDL } from '../idl/damm-v2/idl';
import type { BagsMeteoraFeeClaimer as BagsMeteoraFeeClaimerIDL } from '../idl/bags-meteora-fee-claimer/idl';
import { BagsApiClient } from '../api/bags-client';
import { createBagsFeeShareV2Coder, createBagsFeeShareV2Program, createBagsMeteoraFeeClaimerProgram, createDammV2Program, createDbcProgram } from '../utils/create-program';

export class StateService {
	protected bagsApiClient: BagsApiClient;
	protected dbcProgram: Program<DynamicBondingCurveIDL>;
	protected dammV2Program: Program<DammV2IDL>;
	protected bagsMeteoraFeeClaimer: Program<BagsMeteoraFeeClaimerIDL>;
	protected bagsFeeShareV2: Program<BagsFeeShareIDL>;
	protected bagsFeeShareV2Coder: BorshAccountsCoder;
	protected connection: Connection;
	protected commitment: Commitment;

	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		this.bagsApiClient = new BagsApiClient(apiKey);
		this.dbcProgram = createDbcProgram(connection, commitment).program;
		this.dammV2Program = createDammV2Program(connection, commitment).program;
		this.bagsMeteoraFeeClaimer = createBagsMeteoraFeeClaimerProgram(connection, commitment).program;
		this.bagsFeeShareV2 = createBagsFeeShareV2Program(connection, commitment).program;
		this.bagsFeeShareV2Coder = createBagsFeeShareV2Coder();
		this.connection = connection;
		this.commitment = commitment;
	}
	/**
	 * Get Bags API Client
	 * @returns BagsApiClient
	 */
	getBagsApiClient() {
		return this.bagsApiClient;
	}

	/**
	 * Get DBC Program
	 * @returns Program<DynamicBondingCurveIDL>
	 */
	getDbcProgram() {
		return this.dbcProgram;
	}

	/**
	 * Get DammV2 Program
	 * @returns Program<DammV2IDL>
	 */
	getDammV2Program() {
		return this.dammV2Program;
	}

	/**
	 * Get Bags Meteora Fee Claimer Program
	 * @returns Program<BagsMeteoraFeeClaimerIDL>
	 */
	getBagsMeteoraFeeClaimerProgram() {
		return this.bagsMeteoraFeeClaimer;
	}

	/**
	 * Get Bags Fee Share V2 Program
	 * @returns Program<BagsFeeShareIDL>
	 */
	getBagsFeeShareV2Program() {
		return this.bagsFeeShareV2;
	}

	/**
	 * Get Connection
	 * @returns Connection
	 */
	getConnection() {
		return this.connection;
	}

	/**
	 * Get Commitment
	 * @returns Commitment
	 */
	getCommitment() {
		return this.commitment;
	}

	/**
	 * Get token lifetime fees
	 *
	 * @param tokenMint The mint of the token to get the lifetime fees for
	 * @returns The lifetime fees
	 */
	async getTokenLifetimeFees(tokenMint: PublicKey): Promise<number> {
		const lifeTimeFees = await this.bagsApiClient.get<string>('/token-launch/lifetime-fees', {
			params: {
				tokenMint: tokenMint.toBase58(),
			},
		});

		return parseInt(lifeTimeFees);
	}

	/**
	 * Get token creators
	 *
	 * @param tokenMint The mint of the token to get the creators for
	 * @returns The creators
	 */
	async getTokenCreators(tokenMint: PublicKey): Promise<Array<TokenLaunchCreator>> {
		const creators = await this.bagsApiClient.get<Array<TokenLaunchCreator>>('/token-launch/creator/v3', {
			params: {
				tokenMint: tokenMint.toBase58(),
			},
		});

		return creators;
	}

	/**
	 * @deprecated Use getLaunchWalletV2 instead (this function will be removed in the future)
	 * Get launch wallet for twitter user
	 *
	 * @param twitterUsername The twitter username to get the launch wallet for
	 * @returns The launch wallet
	 */
	async getLaunchWalletForTwitterUsername(twitterUsername: string): Promise<PublicKey> {
		const response = await this.bagsApiClient.get<BagsGetFeeShareWalletV2Response>('/token-launch/fee-share/wallet/v2', {
			params: {
				username: twitterUsername,
				provider: 'twitter',
			},
		});

		return new PublicKey(response.wallet);
	}

	/**
	 * Get pool config key for a fee claimer vault
	 *
	 * WARNING: This function will assume there is only one config key for a fee claimer vault
	 * If this is used for non bags-fee-share fee claimer vault, or the same fee claimer vault has multiple configs, it will return the first config key found
	 *
	 * @param feeClaimerVault The public key of the fee claimer vault
	 * @returns The pool config public key
	 */
	async getPoolConfigKeysByFeeClaimerVaults(feeClaimerVaults: Array<PublicKey>): Promise<Array<PublicKey>> {
		const response = await this.bagsApiClient.post<GetPoolConfigKeyByFeeClaimerVaultApiResponse>(
			'/token-launch/state/pool-config',
			{
				feeClaimerVaults: feeClaimerVaults.map((vault) => vault.toBase58()),
			},
			{
				// 3 minutes timeout, this EP could take very long when first ran assuming there are a lot of configs
				// EP will be cached after first run
				timeout: 180 * 1000,
			}
		);

		const configKeys = response.poolConfigKeys.filter((key) => key !== null).map((key) => new PublicKey(key));

		return configKeys;
	}

	/**
	 * Get token claim stats
	 *
	 * @param tokenMint The mint of the token to get the claim stats for
	 * @returns The creators with claim stats
	 */
	async getTokenClaimStats(tokenMint: PublicKey): Promise<Array<TokenLaunchCreatorV3WithClaimStats>> {
		const response = await this.bagsApiClient.get<GetTokenClaimStatsV2Response>('/token-launch/claim-stats', {
			params: {
				tokenMint: tokenMint.toBase58(),
			},
		});

		if (!response.success) {
			throw new Error('Failed to get token claim stats');
		}

		return response.response;
	}

	/**
	 * Get token claim events
	 *
	 * @param tokenMint The mint of the token to fetch claim events for
	 * @param options Optional pagination configuration
	 * @returns The token claim events
	 */
	async getTokenClaimEvents(tokenMint: PublicKey, options: { limit?: number; offset?: number } = {}): Promise<Array<TokenClaimEvent>> {
		if (!(tokenMint instanceof PublicKey)) {
			throw new Error('tokenMint must be a PublicKey');
		}

		const limit = options.limit ?? 100;
		const offset = options.offset ?? 0;

		if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
			throw new Error('limit must be an integer between 1 and 100');
		}

		if (!Number.isInteger(offset) || offset < 0) {
			throw new Error('offset must be a non-negative integer');
		}

		const response = await this.bagsApiClient.get<GetTokenClaimEventsSuccessResponse>('/fee-share/token/claim-events', {
			params: {
				tokenMint: tokenMint.toBase58(),
				limit,
				offset,
			},
		});

		return response.events;
	}

	/**
	 * Get launch wallet for social username
	 *
	 * @param username The username to get the launch wallet for
	 * @param provider The social provider, e.g. `twitter`, `tiktok`
	 * @returns The launch wallet
	 * @throws Error if the request fails or the response indicates failure
	 */
	async getLaunchWalletV2(username: string, provider: SupportedSocialProvider): Promise<BagsGetFeeShareWalletV2State> {
		try {
			const response = await this.bagsApiClient.get<BagsGetFeeShareWalletV2Response>('/token-launch/fee-share/wallet/v2', {
				params: {
					username,
					provider,
				},
			});

			return {
				platformData: response.platformData,
				provider: response.provider,
				wallet: new PublicKey(response.wallet),
			};
		} catch (error: unknown) {
			throw new Error(`Failed to get launch wallet for ${provider} user ${username}: ${(error as Error)?.message}`);
		}
	}

	/**
	 * Get launch wallets for multiple social usernames
	 *
	 * @param items The usernames and providers to fetch launch wallets for
	 * @returns The launch wallets state for each requested user
	 * @throws Error if the request fails or the response indicates failure
	 */
	async getLaunchWalletV2Bulk(items: Array<GetLaunchWalletV2BulkRequestItem>): Promise<Array<BagsGetFeeShareWalletV2BulkStateItem>> {
		try {
			const response = await this.bagsApiClient.post<Array<BagsGetFeeShareWalletV2BulkResponseItem>>('/token-launch/fee-share/wallet/v2/bulk', {
				items,
			});

			return response.map((item) => ({
				username: item.username,
				provider: item.provider,
				platformData: item.platformData,
				wallet: item.wallet ? new PublicKey(item.wallet) : null,
			}));
		} catch (error: unknown) {
			throw new Error(`Failed to get launch wallets in bulk: ${(error as Error)?.message}`);
		}
	}
}
