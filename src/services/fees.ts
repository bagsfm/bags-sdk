import { Commitment, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import { BagsClaimablePosition } from '../types/meteora';
import { ClaimTransactionApiResponse } from '../types';
import bs58 from 'bs58';

export class FeesService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get claimable positions for a wallet
	 *
	 * @param wallet The public key of the wallet to check
	 * @returns Array of claimable positions with fee information
	 */
	async getAllClaimablePositions(wallet: PublicKey): Promise<Array<BagsClaimablePosition>> {
		const response = await this.bagsApiClient.get<Array<BagsClaimablePosition>>('/token-launch/claimable-positions', {
			params: {
				wallet: wallet.toBase58(),
			},
		});

		return response;
	}

	/**
	 * Get claim transactions for a token
	 *
	 * @param wallet The public key of the wallet claiming fees
	 * @param tokenMint The mint address of the token to claim fees for
	 * @returns Array of versioned transactions to claim fees
	 */
	async getClaimTransactions(wallet: PublicKey, tokenMint: PublicKey): Promise<Array<VersionedTransaction>> {
		const response = await this.bagsApiClient.post<ClaimTransactionApiResponse>('/token-launch/claim-txs/v3', {
			feeClaimer: wallet.toBase58(),
			tokenMint: tokenMint.toBase58(),
		});

		const deserializedTransactions = response.map((tx) => {
			const decodedTransaction = bs58.decode(tx.tx);
			return VersionedTransaction.deserialize(decodedTransaction);
		});

		return deserializedTransactions;
	}
}
