import type { BlockhashWithExpiryBlockHeight, PublicKey } from '@solana/web3.js';

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

interface ClaimTransactionResult {
	tx: string;
	blockhash: BlockhashWithExpiryBlockHeight;
}

export type ClaimTransactionApiResponse = Array<ClaimTransactionResult>;

export type GetPoolConfigKeyByFeeClaimerVaultApiResponse = {
	poolConfigKeys: Array<string>;
};

export const VALID_SOCIAL_PROVIDERS = ['apple', 'google', 'email', 'solana', 'twitter', 'tiktok', 'kick', 'instagram', 'onlyfans', 'github'] as const;
export const SUPPORTED_LAUNCH_SOCIAL_PROVIDERS = ['twitter', 'tiktok', 'kick', 'github'] as const;

export type SocialProvider = (typeof VALID_SOCIAL_PROVIDERS)[number];
export type SupportedSocialProvider = (typeof SUPPORTED_LAUNCH_SOCIAL_PROVIDERS)[number];

export interface TokenLaunchCreator {
	username: string;
	pfp: string;
	royaltyBps: number;
	isCreator: boolean;
	wallet: string;
	provider: SocialProvider | 'unknown' | null;
	providerUsername: string | null;
}

export interface BagsSocialProviderUserData {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string;
}

export type BagsGetFeeShareWalletV2Response<WalletType = string> = {
	provider: SocialProvider;
	platformData: BagsSocialProviderUserData;
	wallet: WalletType;
};

export type BagsGetFeeShareWalletV2State = BagsGetFeeShareWalletV2Response<PublicKey>;

export type BagsGetFeeShareWalletV2ApiResponse = BagsApiResponse<BagsGetFeeShareWalletV2Response>;

export type TransactionTipConfig = {
	tipWallet: PublicKey;
	tipLamports: number;
}

export type TokenLaunchCreatorV3WithClaimStats = TokenLaunchCreator & {
	totalClaimed: string;
};
export type GetTokenClaimStatsV2ErrorResponse = {
	success: false;
	response: string;
};
export type GetTokenClaimStatsV2SuccessResponse = {
	success: true;
	response: Array<TokenLaunchCreatorV3WithClaimStats>;
};
export type GetTokenClaimStatsV2Response = GetTokenClaimStatsV2SuccessResponse | GetTokenClaimStatsV2ErrorResponse;