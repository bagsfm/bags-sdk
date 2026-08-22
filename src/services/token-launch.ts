import { Commitment, Connection, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import bs58 from 'bs58';
import {
	ClaimDammV2VaultParams,
	ClaimDammV2VaultResponse,
	ClaimDammV2VaultWireResponse,
	CreateLaunchTransactionParams,
	CreateTokenInfoParams,
	CreateTokenInfoResponse,
} from '../types/token-launch';
import FormData from 'form-data';
import { prepareImageForFormData } from '../utils/image';
import { validateAndNormalizeCreateTokenInfoParams } from '../utils/validations';

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
			tipWallet: params.tipConfig ? params.tipConfig.tipWallet.toBase58() : undefined,
			tipLamports: params.tipConfig ? params.tipConfig.tipLamports : undefined,
		});

		const decodedSignedTransaction = bs58.decode(encodedSignedTransaction);
		const launchTransaction = VersionedTransaction.deserialize(decodedSignedTransaction);

		return launchTransaction;
	}

	/**
	 * Create token info and metadata
	 *
	 * Server requires an image. You can either:
	 * - provide an image file via `params.image` (uploaded to the EP), or
	 * - provide an `params.imageUrl` to reuse an existing image.
	 *
	 * Optionally, pass `params.metadataUrl` to reuse existing metadata and skip IPFS upload.
	 * If omitted, the server will generate and upload metadata to IPFS.
	 *
	 * @param params The parameters for the token info
	 * @returns The token info response
	 */
	async createTokenInfoAndMetadata(params: CreateTokenInfoParams): Promise<CreateTokenInfoResponse> {
		const normalized = validateAndNormalizeCreateTokenInfoParams(params);

		const formData = new FormData();

		if (normalized.kind === 'file') {
			const imageData = await prepareImageForFormData(normalized.image);
			formData.append('image', imageData.buffer, {
				filename: imageData.filename,
				contentType: imageData.contentType,
			});
		} else {
			formData.append('imageUrl', normalized.imageUrl);
		}

		formData.append('name', normalized.name);
		formData.append('symbol', normalized.symbol);
		formData.append('description', normalized.description);

		if (normalized.telegram) {
			formData.append('telegram', normalized.telegram);
		}
		if (normalized.website) {
			formData.append('website', normalized.website);
		}
		if (normalized.twitter) {
			formData.append('twitter', normalized.twitter);
		}
		if (normalized.metadataUrl) {
			formData.append('metadataUrl', normalized.metadataUrl);
		}

		const response = await this.bagsApiClient.post<CreateTokenInfoResponse>('/token-launch/create-token-info', formData, {
			headers: {
				...formData.getHeaders(),
			},
		});

		return response;
	}

	/**
	 * Claim a DAMM v2 partner/deployer vault
	 *
	 * Sweeps the caller's partner or deployer aggregate vault for a quote mint to their
	 * wallet. The returned transaction is gas-sponsored: the gas sponsor is the fee payer,
	 * and `params.wallet` only needs to co-sign as the authorizer. Throws if the vault is
	 * empty ("Nothing to claim").
	 *
	 * @param params The vault to claim
	 * @returns The claim transaction and the claimable balance it sweeps
	 */
	async claimDammV2Vault(params: ClaimDammV2VaultParams): Promise<ClaimDammV2VaultResponse> {
		const response = await this.bagsApiClient.post<ClaimDammV2VaultWireResponse>('/token-launch/damm-v2/claim-vault', {
			kind: params.kind,
			wallet: params.wallet.toBase58(),
			quoteMint: params.quoteMint.toBase58(),
		});

		const decodedTransaction = bs58.decode(response.transaction);

		return {
			transaction: VersionedTransaction.deserialize(decodedTransaction),
			claimable: response.claimable,
		};
	}
}
