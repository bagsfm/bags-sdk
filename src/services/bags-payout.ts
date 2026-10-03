import { BaseService } from './base';
import {
	BagsPayoutClaimsPage,
	BagsPayoutHistoryItem,
	BagsPayoutHistoryPage,
	BagsPayoutTokenView,
	GetBagsPayoutClaimsParams,
	GetBagsPayoutHistoryParams,
	SetBagsPayoutTokenCashoutParams,
} from '../types';
import { validatePayoutCashout } from '../utils/validations';

const BAGS_PAYOUT_BULK_MAX_TOKENS = 100;

export class BagsPayoutService extends BaseService {
	/**
	 * Get the payout mapping and stats of a token.
	 * @param tokenMint - The token mint address
	 * @returns The payout view, or null when the token has no payout mapping
	 */
	async getToken(tokenMint: string): Promise<BagsPayoutTokenView | null> {
		return this.bagsApiClient.get<BagsPayoutTokenView | null>('/bags-payout/token', { params: { tokenMint } });
	}

	/**
	 * Get the payout mappings of up to 100 tokens.
	 * @param tokenMints - The token mint addresses
	 * @returns One entry per requested mint, in request order; null when a mint has no payout mapping
	 */
	async getTokens(tokenMints: string[]): Promise<Array<BagsPayoutTokenView | null>> {
		if (tokenMints.length < 1 || tokenMints.length > BAGS_PAYOUT_BULK_MAX_TOKENS) {
			throw new Error(`tokenMints must contain between 1 and ${BAGS_PAYOUT_BULK_MAX_TOKENS} items`);
		}

		return this.bagsApiClient.post<Array<BagsPayoutTokenView | null>>('/bags-payout/token/bulk', { tokenMints });
	}

	/**
	 * Change where a token's payout is sent. Only the fee share manager of an existing config may call this.
	 * @param params - The token mint and the new payout handle
	 * @returns The updated payout view
	 */
	async setTokenCashout(params: SetBagsPayoutTokenCashoutParams): Promise<BagsPayoutTokenView> {
		const cashout = validatePayoutCashout(params.cashout);

		return this.bagsApiClient.post<BagsPayoutTokenView>('/bags-payout/token/cashout', { tokenMint: params.tokenMint, cashout });
	}

	/**
	 * Get a page of a token's payouts, newest first.
	 * @param params - The token mint and optional limit, cursor and status filter
	 */
	async getHistory(params: GetBagsPayoutHistoryParams): Promise<BagsPayoutHistoryPage> {
		const status = Array.isArray(params.status) ? params.status.join(',') : params.status;

		return this.bagsApiClient.get<BagsPayoutHistoryPage>('/bags-payout/history', {
			params: { tokenMint: params.tokenMint, limit: params.limit, cursor: params.cursor, status: status || undefined },
		});
	}

	/**
	 * Get a single payout with its confirmed claims populated.
	 * @param id - The payout id (24 hex)
	 * @returns The payout, or null when it does not exist
	 */
	async getPayout(id: string): Promise<BagsPayoutHistoryItem | null> {
		return this.bagsApiClient.get<BagsPayoutHistoryItem | null>('/bags-payout/payout', { params: { id } });
	}

	/**
	 * Get a page of a token's claim transactions, newest first.
	 * @param params - The token mint and optional limit and cursor
	 */
	async getClaims(params: GetBagsPayoutClaimsParams): Promise<BagsPayoutClaimsPage> {
		return this.bagsApiClient.get<BagsPayoutClaimsPage>('/bags-payout/claims', {
			params: { tokenMint: params.tokenMint, limit: params.limit, cursor: params.cursor },
		});
	}
}
