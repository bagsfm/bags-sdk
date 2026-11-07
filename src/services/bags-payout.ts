import { Commitment, Connection } from '@solana/web3.js';
import { BaseService } from './base';
import type { BagsPayoutPayment } from '../types/bags-payout';

export class BagsPayoutService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get one payment: a single fill that paid a payout handle.
	 *
	 * @param id The payment's intent hash (`0x` + 64 hex characters)
	 * @returns The payment, or null when no payout has that fill or it has not paid the handle
	 */
	async getPayment(id: string): Promise<BagsPayoutPayment | null> {
		return this.bagsApiClient.get<BagsPayoutPayment | null>('/bags-payout/payment', {
			params: { id },
		});
	}
}
