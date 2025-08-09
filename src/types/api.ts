import { BlockhashWithExpiryBlockHeight } from '@solana/web3.js';

type BagsSuccessApiResponse<T> = {
	success: true;
	response: T;
};

type BagsErrorApiResponse = {
	success: false;
	error: string;
};

export type BagsApiResponse<T> = BagsSuccessApiResponse<T> | BagsErrorApiResponse;

export interface TransactionConfigApiResponse {
	tx: string | null;
	configKey: string;
}

export interface FeeShareTransactionConfigApiResponse {
	tx: string;
	configKey: string;
}

export interface TokenLaunchCreator {
	username: string;
	pfp: string;
	twitterUsername: string | null;
	royaltyBps: number;
	isCreator: boolean;
}

interface ClaimTransactionResult {
	tx: string;
	blockhash: BlockhashWithExpiryBlockHeight;
}

export type ClaimTransactionApiResponse = Array<ClaimTransactionResult>;

export type GetPoolConfigKeyByFeeClaimerVaultApiResponse = {
	poolConfigKeys: Array<string>;
};