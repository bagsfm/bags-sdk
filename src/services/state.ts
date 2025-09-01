import { type Commitment, type Connection, PublicKey } from '@solana/web3.js';
import type { GetPoolConfigKeyByFeeClaimerVaultApiResponse, SupportedSocialProvider, TokenLaunchCreator } from '../types/api';
import type { Program } from '@coral-xyz/anchor';
import type { DynamicBondingCurve as DynamicBondingCurveIDL } from '../idl/dynamic-bonding-curve/idl';
import type { DammV2 as DammV2IDL } from '../idl/damm-v2/idl';
import type { BagsMeteoraFeeClaimer as BagsMeteoraFeeClaimerIDL } from '../idl/bags-meteora-fee-claimer/idl';
import { BagsApiClient } from '../api/bags-client';
import { createBagsMeteoraFeeClaimerProgram, createDammV2Program, createDbcProgram } from '../utils/create-program';

export class StateService {
	protected bagsApiClient: BagsApiClient;
	protected dbcProgram: Program<DynamicBondingCurveIDL>;
	protected dammV2Program: Program<DammV2IDL>;
	protected bagsMeteoraFeeClaimer: Program<BagsMeteoraFeeClaimerIDL>;
	protected connection: Connection;
	protected commitment: Commitment;

	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		this.bagsApiClient = new BagsApiClient(apiKey);
		this.dbcProgram = createDbcProgram(connection, commitment).program;
		this.dammV2Program = createDammV2Program(connection, commitment).program;
		this.bagsMeteoraFeeClaimer = createBagsMeteoraFeeClaimerProgram(connection, commitment).program;
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
	 * Get launch wallet for twitter user
	 *
	 * @param twitterUsername The twitter username to get the launch wallet for
	 * @returns The launch wallet
	 */
	async getLaunchWalletForTwitterUsername(twitterUsername: string): Promise<PublicKey> {
		const wallet = await this.bagsApiClient.get<string>('/token-launch/fee-share/wallet/twitter', {
			params: {
				twitterUsername,
			},
		});

		return new PublicKey(wallet);
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

		const configKeys = response.poolConfigKeys.map((key) => new PublicKey(key));

		return configKeys;
	}

	/**
	 * Get launch wallet for social username
	 *
	 * @param username The username to get the launch wallet for
	 * @param provider The social provider, e.g. `twitter`, `tiktok`
	 * @returns The launch wallet
	 */
	async getLaunchWalletV2(username: string, provider: SupportedSocialProvider): Promise<PublicKey> {
		const wallet = await this.bagsApiClient.get<string>('/token-launch/fee-share/wallet/v2', {
			params: {
				username,
				provider,
			},
		});

		return new PublicKey(wallet);
	}
}
