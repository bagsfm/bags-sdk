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

export interface JupiterTokenFirstPool {
	id: string;
	createdAt: string;
}

export interface JupiterTokenAudit {
	topHoldersPercentage?: number;
	highSingleOwnership?: boolean;
	blockaidHoneypot?: boolean;
	mintAuthorityDisabled?: boolean;
	freezeAuthorityDisabled?: boolean;
	devMigrations?: number;
	blockaidRugpull?: boolean;
	blockaidWashTrading?: boolean;
	blockaidHiddenKeyHolder?: boolean;
}

export interface JupiterTokenStats {
	priceChange?: number;
	holderChange?: number;
	liquidityChange?: number;
	volumeChange?: number;
	buyVolume?: number;
	sellVolume?: number;
	buyOrganicVolume?: number;
	sellOrganicVolume?: number;
	numBuys?: number;
	numSells?: number;
	numTraders?: number;
	numOrganicBuyers?: number;
	numNetBuyers?: number;
}

export interface JupiterToken {
	id: string;
	name: string;
	symbol: string;
	icon: string;
	decimals: number;
	twitter?: string;
	website?: string;
	telegram?: string;
	dev: string;
	circSupply: number;
	totalSupply: number;
	tokenProgram: string;
	launchpad?: string;
	metaLaunchpad?: string;
	partnerConfig?: string;
	mintAuthority?: string;
	freezeAuthority?: string;
	firstPool: JupiterTokenFirstPool;
	graduatedPool?: string;
	graduatedAt?: string;
	holderCount: number;
	audit: JupiterTokenAudit;
	organicScore: number;
	organicScoreLabel: string;
	tags: string[];
	fdv: number;
	mcap: number;
	usdPrice: number;
	priceBlockId: number;
	liquidity: number;
	stats5m?: JupiterTokenStats;
	stats1h?: JupiterTokenStats;
	stats6h?: JupiterTokenStats;
	stats24h?: JupiterTokenStats;
	bondingCurve?: number;
	ctLikes?: number;
	smartCtLikes?: number;
	updatedAt: string;
}

export type TokenAmount = {
	/** Raw amount of tokens as string ignoring decimals */
	amount: string;
	/** Number of decimals configured for token's mint */
	decimals: number;
	/** Token amount as float, accounts for decimals */
	uiAmount: number | null;
	/** Token amount as string, accounts for decimals */
	uiAmountString?: string;
};

export type TokenLatestPrice = {
	price: number;
	priceUSD: number;
	priceSOL: number;
	volumeUSD: number;
	volumeSOL: number;
	tokenAddress: string;
	blockTime: string;
};

export type BagsTokenLeaderBoardItem = {
	token: string,
	lifetimeFees: string,
	tokenInfo: JupiterToken | null,
	creators: Array<TokenLaunchCreator> | null,
	tokenSupply: TokenAmount | null,
	tokenLatestPrice: TokenLatestPrice | null
};

export type GetTopTokensByLifetimeFeesSuccessResponse = {
	success: true;
	response: Array<BagsTokenLeaderBoardItem>;
};

export type GetTopTokensByLifetimeFeesErrorResponse = {
	success: false;
	response: string;
};

export type GetTopTokensByLifetimeFeesResponse = GetTopTokensByLifetimeFeesSuccessResponse | GetTopTokensByLifetimeFeesErrorResponse;