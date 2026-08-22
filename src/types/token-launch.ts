import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BAGS_CONFIG_TYPE, TransactionTipConfig } from './api';
import type { ImageInput } from '../utils/image';

export type GetOrCreateConfigResponse = {
	transaction: VersionedTransaction | null;
	configKey: PublicKey;
};

export type CreateFeeShareConfigResponse = {
	transaction: VersionedTransaction;
	configKey: PublicKey;
};

export interface CreateLaunchTransactionParams {
	metadataUrl: string;
	tokenMint: PublicKey;
	launchWallet: PublicKey;
	initialBuyLamports: number;
	configKey: PublicKey;
	tipConfig?: TransactionTipConfig;
}

/**
 * Parameters for creating token info and (optionally) uploading metadata.
 *
 * Exactly one of `image` or `imageUrl` must be provided at compile-time.
 * Optionally, `metadataUrl` can be provided to bypass metadata upload.
 */
export type CreateTokenInfoParams = (
	| {
			image: ImageInput;
			imageUrl?: never;
	  }
	| {
			image?: never;
			imageUrl: string;
	  }
) & {
	name: string;
	symbol: string;
	description: string;
	telegram?: string;
	twitter?: string;
	website?: string;
	/**
	 * Optional: Provide an existing metadata URL (e.g., IPFS/Arweave).
	 * If omitted, the server will create and upload metadata for you.
	 */
	metadataUrl?: string;
};

export enum TokenLaunchStatus {
	PRE_LAUNCH = 'PRE_LAUNCH',
	PRE_GRAD = 'PRE_GRAD',
	MIGRATING = 'MIGRATING',
	MIGRATED = 'MIGRATED',
}

export interface BagsLaunchPadTokenLaunch {
	userId: string | null;
	name: string;
	symbol: string;
	description: string;
	telegram: string | null;
	twitter: string | null;
	website: string | null;
	image: string;
	tokenMint: string;
	status: TokenLaunchStatus;
	launchWallet: string | null;
	launchSignature: string | null;
	/** Launch transaction account keys. */
	accountKeys: string[] | null;
	/** Number of required launch transaction signers. */
	numRequiredSigners: number | null;
	/** Creator fee in basis points. */
	creatorFeeBps: number | null;
	uri: string | null;
	/** Meteora DBC pool address. */
	dbcPoolKey: string | null;
	/** Meteora DBC config address. */
	dbcConfigKey: string | null;
	/** DBC launch mode. `null` when the token has no `dbcConfigKey` (pre-launch or DAMM v2 direct). */
	bagsConfigType: (typeof BAGS_CONFIG_TYPE)[keyof typeof BAGS_CONFIG_TYPE] | null;
	/** DAMM v2 pool address. */
	dammV2PoolKey: string | null;
	/** Launch mechanism; `null` means legacy DBC. */
	launchType: string | null;
	/** DAMM v2 direct quote mint. */
	quoteMint: string | null;
	/** Treasury position NFT mint. */
	dammV2TreasuryPositionNftMint: string | null;
	/** Fee claimer position NFT mint. */
	dammV2FeeClaimerPositionNftMint: string | null;
	/** Fee claimer wallet. */
	feeClaimerWallet: string | null;
	/** Address lookup table used by the launch. */
	dammV2LookupTable: string | null;
	/** DAMM v2 position custody account. */
	dammV2PositionCustody: string | null;
	/** Authority for the DAMM v2 custody account. */
	dammV2CustodyAuthority: string | null;
	/** Optional custody partner wallet. */
	dammV2Partner: string | null;
	/** Optional custody deployer wallet. */
	dammV2Deployer: string | null;
	/** Deployer fee collection mode. */
	dammV2DeployerFeeCollectionMode: number | null;
	/** Deployer platform fee in basis points. */
	dammV2DeployerPlatformBps: number | null;
	/** Deployer claimer fee in basis points. */
	dammV2DeployerClaimersBps: number | null;
	createdAt: string;
	updatedAt: string;
}

export type TokenLaunchResponseItem = Omit<BagsLaunchPadTokenLaunch, 'userId'>;

export type DammV2DirectLaunch = Omit<BagsLaunchPadTokenLaunch, 'userId'>;

export interface GetDammV2LaunchesParams {
	/** Page size, 1-100. Defaults to 20 server-side. */
	limit?: number;
	/** Base58 quote mint to filter launches by. */
	quoteMint?: PublicKey;
	/** Cursor from a previous response's `nextCursor`. Omit for the first page. */
	cursor?: string;
}

export interface GetDammV2LaunchesResponse {
	/** Confirmed DAMM v2 direct launches, newest first. */
	launches: DammV2DirectLaunch[];
	/** True when another page of results exists. */
	hasMore: boolean;
	/** Cursor to pass as `cursor` to fetch the next page, or null on the last page. */
	nextCursor: string | null;
}

export interface CreateTokenInfoResponse {
	tokenMint: string;
	tokenMetadata: string;
	tokenLaunch: BagsLaunchPadTokenLaunch;
}

type FeeShareUser = {
	wallet: PublicKey;
	bps: number;
};

export type CreateFeeShareConfigParams = {
	/* This has to be 2 user and 10000 in total */
	users: Array<FeeShareUser>;
	payer: PublicKey;
	baseMint: PublicKey;
	/* This needs to be wSOL mint atm */
	quoteMint: PublicKey;
	tipConfig?: TransactionTipConfig;
};

export type NormalizedCreateTokenInfoParams =
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	| ({ kind: 'file'; image: any } & {
			name: string;
			symbol: string;
			description: string;
			telegram?: string;
			twitter?: string;
			website?: string;
			metadataUrl?: string;
	  })
	| ({ kind: 'url'; imageUrl: string } & {
			name: string;
			symbol: string;
			description: string;
			telegram?: string;
			twitter?: string;
			website?: string;
			metadataUrl?: string;
	  });

export type NormalizedCreateFeeShareConfigParams = {
	basisPointsArray: Array<number>;
	payer: string;
	baseMint: string;
	partner?: string;
	partnerConfig?: string;
	claimersArray: Array<string>;
	tipWallet?: string;
	tipLamports?: number;
	additionalLookupTables?: Array<string>;
	admin?: string;
	bagsConfigType?: (typeof BAGS_CONFIG_TYPE)[keyof typeof BAGS_CONFIG_TYPE];
	enableFirstSwapWithMinFee?: boolean;
};

export interface DammV2SupportedQuoteToken {
	/** Quote mint public key. */
	mint: string;
	/** Token program that owns the mint (`Tokenkeg...` or `TokenzQd...`). */
	tokenProgram: string;
	decimals: number;
	/** Token 2022 on-chain name, or `null` when the mint has no TokenMetadata extension. */
	name: string | null;
	/** Token 2022 on-chain symbol, or `null` when the mint has no TokenMetadata extension. */
	symbol: string | null;
	/** Token 2022 metadata JSON URI, or `null` when the mint has no TokenMetadata extension. */
	uri: string | null;
	/** Token image URL, or `null` when neither a CDN image nor an image URI is set. */
	image: string | null;
}

export type DammV2VaultKind = 'partner' | 'deployer';

export interface DammV2VaultClaimable {
	/** Which aggregate vault this balance belongs to. */
	kind: DammV2VaultKind;
	/** Public key of the partner/deployer wallet. */
	wallet: string;
	/** Public key of the quote mint this vault is denominated in. */
	quoteMint: string;
	/** Decimals of the quote mint. */
	quoteDecimals: number;
	/** Public key of the vault's associated token account. */
	vaultAta: string;
	/** Claimable balance in quote mint base units. */
	claimableAmount: number;
	/** Claimable balance in whole quote tokens. */
	claimableDisplayAmount: number;
}

export interface ClaimDammV2VaultParams {
	/** Which aggregate vault to sweep. */
	kind: DammV2VaultKind;
	/** The partner/deployer wallet whose vault is being swept (also the destination). */
	wallet: PublicKey;
	/** Quote mint of the vault to sweep. */
	quoteMint: PublicKey;
}

export interface ClaimDammV2VaultResponse {
	/**
	 * Gas-sponsored transaction that drains the vault to the wallet's ATA. The gas sponsor
	 * is the fee payer; `params.wallet` only needs to co-sign as the authorizer.
	 */
	transaction: VersionedTransaction;
	claimable: DammV2VaultClaimable;
}

/** @internal Wire shape before the transaction is decoded. */
export interface ClaimDammV2VaultWireResponse {
	transaction: string;
	claimable: DammV2VaultClaimable;
}

export type GetTokenLaunchResponse = TokenLaunchResponseItem | null;

export type GetTokenLaunchBulkResponse = Array<TokenLaunchResponseItem | null>;
