import { PublicKey, VersionedTransaction } from '@solana/web3.js';

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
}

export interface CreateTokenInfoParams {
	image: File | Blob | Buffer | { value: Buffer; options: { filename: string; contentType: string } } | any;
	name: string;
	symbol: string;
	description: string;
	telegram?: string;
	twitter?: string;
	website?: string;
}

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
};
