import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { BaseService } from './base';
import { GetDividendHistoryParams, GetDividendHistoryResponse, GetDividendProfileBulkResponse, DividendProfileView, GetDividendStatusResponse } from '../types/dividends';

export class DividendsService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get the dividend profile for a token launch.
	 *
	 * @param tokenMint The launch mint to look up
	 * @returns The dividend profile, or null when the token has none
	 */
	async getProfile(tokenMint: PublicKey): Promise<DividendProfileView | null> {
		return this.bagsApiClient.get<DividendProfileView | null>('/dividends/profile', {
			params: { tokenMint: tokenMint.toBase58() },
		});
	}

	/**
	 * Get dividend profiles for up to 100 token launches in one request.
	 *
	 * @param tokenMints The launch mints to look up (1-100)
	 * @returns The dividend profiles, aligned to and the same length as `tokenMints`, with null for mints without a profile
	 */
	async getProfilesBulk(tokenMints: PublicKey[]): Promise<GetDividendProfileBulkResponse> {
		return this.bagsApiClient.post<GetDividendProfileBulkResponse>('/dividends/profile/bulk', {
			tokenMints: tokenMints.map((tokenMint) => tokenMint.toBase58()),
		});
	}

	/**
	 * Get the live distribution status for a token launch's dividend basket.
	 *
	 * @param tokenMint The launch mint to look up
	 * @returns The current phase, profile, and latest cycle
	 */
	async getStatus(tokenMint: PublicKey): Promise<GetDividendStatusResponse> {
		return this.bagsApiClient.get<GetDividendStatusResponse>('/dividends/status', {
			params: { tokenMint: tokenMint.toBase58() },
		});
	}

	/**
	 * Get completed distribution cycles for a token launch's dividend basket, newest first.
	 *
	 * @param params The token mint to look up, plus pagination options
	 * @returns The page of completed cycles
	 */
	async getHistory(params: GetDividendHistoryParams): Promise<GetDividendHistoryResponse> {
		return this.bagsApiClient.get<GetDividendHistoryResponse>('/dividends/history', {
			params: {
				tokenMint: params.tokenMint.toBase58(),
				limit: params.limit,
				cursor: params.cursor,
			},
		});
	}
}
