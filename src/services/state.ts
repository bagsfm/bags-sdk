import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { BaseService } from './base';
import { TokenLaunchCreator } from '../types/api';

export class StateService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
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
		const creators = await this.bagsApiClient.get<Array<TokenLaunchCreator>>('/token-launch/creator/v2', {
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
}
