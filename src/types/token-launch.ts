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

export interface CreateDammV2LaunchTransactionParams {
	/** Metadata URI from `createTokenInfoAndMetadata`. */
	metadataUrl: string;
	/** Mint from `createTokenInfoAndMetadata`. */
	tokenMint: PublicKey;
	/** Launch wallet; fee payer and signer of every transaction in the bundle. */
	wallet: PublicKey;
	/** Badged quote mint (see `getDammV2SupportedQuoteTokens`). */
	quoteMint: PublicKey;
	/** Receives the 50% fee position NFT; defaults to `wallet`. */
	feeClaimerWallet?: PublicKey;
	/** Initial buy amount in quote mint base units; `wallet` must already hold this quote balance at build time. */
	initialBuyQuoteAmount?: number;
	/** Existing PartnerConfig wallet to attach to the custody (its global bps applies). */
	partner?: PublicKey;
}

export type DammV2LaunchTransactionBundleItemType = 'LUT_SETUP' | 'CREATE_TOKEN' | 'LAUNCH' | 'LUT_DEACTIVATE' | 'LUT_CLOSE';

export interface DammV2LaunchTransactionBundleItem {
	/** Which step of the launch bundle this transaction performs. */
	type: DammV2LaunchTransactionBundleItemType;
	/** Base58-encoded serialized transaction. */
	transaction: string;
}

export interface DammV2LaunchDetails {
	tokenMint: string;
	quoteMint: string;
	quoteTokenProgram: string;
	pool: string;
	treasuryPositionNftMint: string;
	feeClaimerPositionNftMint: string;
	feeClaimerWallet: string;
	lookupTable: string;
	positionCustody: string;
	custodyAuthority: string;
	launchPriceQuotePerToken: number;
	impliedLaunchFdvUsd: number;
}

export interface CreateDammV2LaunchTransactionResponse {
	/** Ordered transaction bundle; each must be co-signed by `wallet` before submission. */
	transactions: DammV2LaunchTransactionBundleItem[];
	launch: DammV2LaunchDetails;
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
	uri: string | null;
	createdAt: string;
	updatedAt: string;
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
