import { Commitment, Connection } from '@solana/web3.js';
import { BaseService } from './base';
import { CreateRobinhoodClaimTransactionsParams, RobinhoodClaimablePositions, RobinhoodClaimTransactions } from '../types/robinhood';

export class RobinhoodService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get all claimable Robinhood Chain fee positions for an owner.
	 *
	 * @param owner The EVM wallet address to check
	 */
	async getClaimablePositions(owner: string): Promise<RobinhoodClaimablePositions> {
		return this.bagsApiClient.get<RobinhoodClaimablePositions>('/evm/rh/claimable-positions', {
			params: { owner },
		});
	}

	/**
	 * Create unsigned Robinhood Chain claim transactions for a token.
	 *
	 * @param params The token and owner addresses for the claim
	 */
	async createClaimTransactions(params: CreateRobinhoodClaimTransactionsParams): Promise<RobinhoodClaimTransactions> {
		return this.bagsApiClient.post<RobinhoodClaimTransactions>('/evm/rh/create-claim-txs', params);
	}
}
