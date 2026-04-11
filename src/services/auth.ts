import { Commitment, Connection } from '@solana/web3.js';
import { BaseService } from './base';
import type { AuthMeResponse } from '../types';

export class AuthService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get information about the user that owns the current API key.
	 *
	 * @returns The authenticated Bags user profile.
	 */
	async me(): Promise<AuthMeResponse> {
		return this.bagsApiClient.get<AuthMeResponse>('/auth/me');
	}
}
