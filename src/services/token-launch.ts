import { Commitment, Connection, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import bs58 from 'bs58';
import { CreateLaunchTransactionParams, CreateTokenInfoParams, CreateTokenInfoResponse } from '../types/token-launch';
import FormData from 'form-data';
import { prepareImageForFormData } from '../utils/image';

export class TokenLaunchService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get token launch transaction
	 *
	 * @param params The parameters for the token launch transaction
	 * @returns The token launch transaction
	 */
	async createLaunchTransaction(params: CreateLaunchTransactionParams): Promise<VersionedTransaction> {
		const encodedSignedTransaction = await this.bagsApiClient.post<string>('/token-launch/create-launch-transaction', {
			ipfs: params.metadataUrl,
			tokenMint: params.tokenMint.toBase58(),
			wallet: params.launchWallet.toBase58(),
			initialBuyLamports: params.initialBuyLamports,
			configKey: params.configKey.toBase58(),
		});

		const decodedSignedTransaction = bs58.decode(encodedSignedTransaction);
		const launchTransaction = VersionedTransaction.deserialize(decodedSignedTransaction);

		return launchTransaction;
	}

	/**
	 * Create token info and metadata
	 *
	 * @param params The parameters for the token info
	 * @returns The token info
	 */
	async createTokenInfoAndMetadata(params: CreateTokenInfoParams): Promise<CreateTokenInfoResponse> {
		const formData = new FormData();

		const imageData = await prepareImageForFormData(params.image);

		formData.append('image', imageData.buffer, {
			filename: imageData.filename,
			contentType: imageData.contentType,
		});

		formData.append('name', params.name);
		formData.append('symbol', params.symbol);
		formData.append('description', params.description);

		if (params.telegram) {
			formData.append('telegram', params.telegram);
		}
		if (params.website) {
			formData.append('website', params.website);
		}
		if (params.twitter) {
			formData.append('twitter', params.twitter);
		}

		const response = await this.bagsApiClient.post<CreateTokenInfoResponse>('/token-launch/create-token-info', formData, {
			headers: {
				...formData.getHeaders(),
			},
		});

		return response;
	}
}
