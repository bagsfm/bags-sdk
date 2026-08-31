import { Commitment, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import bs58 from 'bs58';
import {
	ClaimDammV2VaultParams,
	ClaimDammV2VaultResponse,
	ClaimDammV2VaultWireResponse,
	CreateDammV2LaunchTransactionParams,
	CreateDammV2LaunchTransactionResponse,
	CreateLaunchTransactionParams,
	CreateTokenInfoParams,
	CreateTokenInfoResponse,
	DammV2SupportedQuoteToken,
	DammV2VaultClaimable,
	GetDammV2LaunchesParams,
	GetDammV2LaunchesResponse,
	GetTokenLaunchBulkResponse,
	GetTokenLaunchResponse,
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
	 * Create a DAMM v2 direct launch transaction bundle
	 *
	 * Builds the partially-signed transaction bundle that launches a token previously
	 * registered via `createTokenInfoAndMetadata` straight into a single-sided DAMM v2
	 * customizable pool (no DBC bonding curve, no migration). Every transaction in the
	 * bundle must be co-signed by `params.wallet` before submission. `params.quoteMint`
	 * must currently be badged and in the Jupiter trending-stocks whitelist; a mint that
	 * built successfully before can fail here if it has since rotated out.
	 *
	 * @param params The parameters for the DAMM v2 direct launch
	 * @returns The transaction bundle and launch details
	 */
	async createDammV2LaunchTransaction(params: CreateDammV2LaunchTransactionParams): Promise<CreateDammV2LaunchTransactionResponse> {
		const response = await this.bagsApiClient.post<CreateDammV2LaunchTransactionResponse>('/token-launch/damm-v2/create-transaction', {
			ipfs: params.metadataUrl,
			tokenMint: params.tokenMint.toBase58(),
			wallet: params.wallet.toBase58(),
			quoteMint: params.quoteMint.toBase58(),
			feeClaimerWallet: params.feeClaimerWallet?.toBase58(),
			initialBuyQuoteAmount: params.initialBuyQuoteAmount,
			partner: params.partner?.toBase58(),
		});

		return response;
	}

	/**
	 * Get DAMM v2 vault claimables
	 *
	 * Every non-empty partner/deployer aggregate vault balance for a wallet.
	 *
	 * @param wallet The partner/deployer wallet to look up
	 * @returns The claimable vault balances
	 */
	async getDammV2VaultClaimables(wallet: PublicKey): Promise<DammV2VaultClaimable[]> {
		const response = await this.bagsApiClient.get<{ vaults: DammV2VaultClaimable[] }>('/token-launch/damm-v2/vault-claimables', {
			params: {
				wallet: wallet.toBase58(),
			},
		});

		return response.vaults;
	}

	/**
	 * Get DAMM v2 supported quote tokens
	 *
	 * Every quote mint currently usable for DAMM v2 direct launches: mints holding a
	 * cp-amm TokenBadge that are also in the Jupiter trending-stocks whitelist (top 100
	 * by 24h volume, refreshed every 6 hours). A mint can rotate in and out of this list.
	 *
	 * @returns The supported quote tokens
	 */
	async getDammV2SupportedQuoteTokens(): Promise<DammV2SupportedQuoteToken[]> {
		const response = await this.bagsApiClient.get<{ tokens: DammV2SupportedQuoteToken[] }>('/token-launch/damm-v2/supported-quote-tokens');

		return response.tokens;
	}

	/**
	 * Get token launches in bulk
	 *
	 * Fetches token launch records for up to 100 token mints in one request. Results
	 * preserve input order, with `null` for a mint that has no launch record.
	 *
	 * @param tokenMints The token mints to look up (1-100 unique keys)
	 * @returns The token launch records, in the same order as `tokenMints`
	 */
	async getTokenLaunchesBulk(tokenMints: PublicKey[]): Promise<GetTokenLaunchBulkResponse> {
		const response = await this.bagsApiClient.post<GetTokenLaunchBulkResponse>('/token-launch/bulk', {
			tokenMints: tokenMints.map((tokenMint) => tokenMint.toBase58()),
		});

		return response;
	}

	/**
	 * Get a token launch by mint
	 *
	 * @param tokenMint The token mint to look up
	 * @returns The token launch record, or null if no launch exists for the mint
	 */
	async getTokenLaunch(tokenMint: PublicKey): Promise<GetTokenLaunchResponse> {
		const response = await this.bagsApiClient.get<GetTokenLaunchResponse>('/token-launch', {
			params: {
				tokenMint: tokenMint.toBase58(),
			},
		});

		return response;
	}

	/**
	 * Get confirmed DAMM v2 direct launches
	 *
	 * Newest-first, paginated list of confirmed DAMM v2 direct launches, optionally filtered
	 * by quote mint.
	 *
	 * @param params Pagination and filter options
	 * @returns The page of launches
	 */
	async getDammV2Launches(params: GetDammV2LaunchesParams = {}): Promise<GetDammV2LaunchesResponse> {
		const response = await this.bagsApiClient.get<GetDammV2LaunchesResponse>('/token-launch/damm-v2/launches', {
			params: {
				limit: params.limit,
				quoteMint: params.quoteMint?.toBase58(),
				cursor: params.cursor,
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
