import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { BaseService } from './base';
import type { BagsPayHistory, BagsPayStatus, BagsPayToken, GetBagsPayHistoryOptions } from '../types';

export class BagsPayService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get who a coin's BagsPay fees pay, plus its lifetime stats.
	 * @param tokenMint - The token mint.
	 * @returns The mapping, or null when the coin has none. A coin without a mapping can still be paid (the bot auto-maps it on its first claim or holds the share in reserve); see `getStatus`.
	 */
	async getToken(tokenMint: PublicKey): Promise<BagsPayToken | null> {
		return this.bagsApiClient.get<BagsPayToken | null>('/bags-pay/token', {
			params: { tokenMint: tokenMint.toBase58() },
		});
	}

	/**
	 * Get BagsPay mappings for several coins in one call.
	 * @param tokenMints - Between 1 and 100 token mints.
	 * @returns An array aligned to `tokenMints`, with null for mints that have no mapping.
	 */
	async getTokensBulk(tokenMints: PublicKey[]): Promise<Array<BagsPayToken | null>> {
		if (tokenMints.length < 1 || tokenMints.length > 100) {
			throw new Error('tokenMints must contain between 1 and 100 mints');
		}

		return this.bagsApiClient.post<Array<BagsPayToken | null>>('/bags-pay/token/bulk', {
			tokenMints: tokenMints.map((tokenMint) => tokenMint.toBase58()),
		});
	}

	/**
	 * Get a coin's current BagsPay phase, its open distribution, and any reserved vault share.
	 * @param tokenMint - The token mint.
	 * @returns The status, including deferral and airdrop progress of the open distribution.
	 */
	async getStatus(tokenMint: PublicKey): Promise<BagsPayStatus> {
		return this.bagsApiClient.get<BagsPayStatus>('/bags-pay/status', {
			params: { tokenMint: tokenMint.toBase58() },
		});
	}

	/**
	 * Get a coin's split distributions, newest first.
	 * @param tokenMint - The token mint.
	 * @param options - Optional `limit` (1 to 50, default 20) and `cursor` from a previous page's `nextCursor`.
	 * @returns A page of distributions with `hasMore` and `nextCursor`.
	 */
	async getHistory(tokenMint: PublicKey, options: GetBagsPayHistoryOptions = {}): Promise<BagsPayHistory> {
		const params: Record<string, string | number> = { tokenMint: tokenMint.toBase58() };

		if (options.limit !== undefined) params.limit = options.limit;
		if (options.cursor !== undefined) params.cursor = options.cursor;

		return this.bagsApiClient.get<BagsPayHistory>('/bags-pay/history', { params });
	}
}
