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

export const VALID_SOCIAL_PROVIDERS = ['apple', 'google', 'email', 'solana', 'twitter', 'tiktok', 'kick', 'instagram', 'onlyfans', 'github', 'moltbook'] as const;
export const SUPPORTED_LAUNCH_SOCIAL_PROVIDERS = ['twitter', 'tiktok', 'kick', 'github'] as const;

export type SocialProvider = (typeof VALID_SOCIAL_PROVIDERS)[number];
export type SupportedSocialProvider = (typeof SUPPORTED_LAUNCH_SOCIAL_PROVIDERS)[number];

export const FEE_SHARE_WALLET_CHAINS = ['SOL', 'EVM'] as const;
export type FeeShareWalletChain = (typeof FEE_SHARE_WALLET_CHAINS)[number];

export interface TokenLaunchCreator {
	username: string;
	pfp: string;
	royaltyBps: number;
	isCreator: boolean;
	wallet: string;
	provider: SocialProvider | 'unknown' | null;
	providerUsername: string | null;
	twitterUsername?: string;
	bagsUsername?: string;
	isAdmin?: boolean;
}

export interface EvmTokenCreator {
	username: string;
	pfp: string;
	royaltyBps: number;
	isCreator: boolean;
	wallet: string;
	provider?: SocialProvider | 'unknown' | null;
	providerUsername?: string | null;
	twitterUsername?: string;
	bagsUsername?: string;
}

export interface BagsSocialProviderUserData {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string;
}

export type BagsGetFeeShareWalletV2Response = {
	provider: SocialProvider;
	platformData: BagsSocialProviderUserData;
	wallet: string;
	chain: FeeShareWalletChain;
};

export type BagsGetFeeShareWalletV2SolState = {
	provider: SocialProvider;
	platformData: BagsSocialProviderUserData;
	wallet: PublicKey;
	chain: 'SOL';
};

export type BagsGetFeeShareWalletV2EvmState = {
	provider: SocialProvider;
	platformData: BagsSocialProviderUserData;
	wallet: string;
	chain: 'EVM';
};

export type BagsGetFeeShareWalletV2State = BagsGetFeeShareWalletV2SolState | BagsGetFeeShareWalletV2EvmState;

export type TransactionTipConfig = {
	tipWallet: PublicKey;
	tipLamports: number;
};

export type BagsFeeClaimer = {
	user: PublicKey;
	userBps: number;
};

export const BAGS_CONFIG_TYPE = {
	DEFAULT: 'fa29606e-5e48-4c37-827f-4b03d58ee23d',
	BPS25PRE_BPS100POST_5000_COMPOUNDING: 'd16d3585-6488-4a6c-9a6f-e6c39ca0fda3',
	BPS100PRE_BPS25POST_5000_COMPOUNDING: 'a7c8e1f2-3d4b-5a6c-9e0f-1b2c3d4e5f6a',
	BPS1000PRE_BPS1000POST_5000_COMPOUNDING: '48e26d2f-0a9d-4625-a3cc-c3987d874b9e',
	BPS200PRE_BPS200POST_85_LOCKED: '810faadb-030b-47de-a68b-7211c1cbbee3',
	DEFAULT_1K_SUPPLY: 'e2963a6c-441a-4862-9d80-b94e3a481cd7',
	DEFAULT_96_LOCKED: 'ba28db46-ea6f-4452-8218-5587f6aca0a1',
} as const;

export type BagsGetOrCreateFeeShareConfigArgs = {
	feeClaimers: Array<BagsFeeClaimer>;
	payer: PublicKey;
	baseMint: PublicKey;
	partner?: PublicKey;
	partnerConfig?: PublicKey;
	additionalLookupTables?: Array<PublicKey>;
	admin?: PublicKey;
	bagsConfigType?: (typeof BAGS_CONFIG_TYPE)[keyof typeof BAGS_CONFIG_TYPE];
	enableFirstSwapWithMinFee?: boolean;
};

export type TransactionWithBlockhash = {
	transaction: string;
	blockhash: BlockhashWithExpiryBlockHeight;
};

export type PartnerConfigClaimStatsResponse = {
	claimedFees: string;
	unclaimedFees: string;
};

export type TokenLaunchCreatorV3WithClaimStats = {
	totalClaimed: string;
	tokenMint: string;
	wallet: string;
};

export type GetTokenClaimStatsV2Response = Array<TokenLaunchCreatorV3WithClaimStats>;

export type GetLaunchWalletV2BulkRequestItem = {
	username: string;
	provider: SupportedSocialProvider;
	chain?: FeeShareWalletChain;
};

export type BagsGetFeeShareWalletV2BulkResponseItem = {
	username: string;
	provider: BagsGetFeeShareWalletV2Response['provider'];
	platformData: BagsGetFeeShareWalletV2Response['platformData'] | null;
	wallet: string | null;
	chain: FeeShareWalletChain;
};

export type BagsGetFeeShareWalletV2BulkSolStateItem = {
	username: string;
	provider: SocialProvider;
	platformData: BagsSocialProviderUserData | null;
	wallet: PublicKey | null;
	chain: 'SOL';
};

export type BagsGetFeeShareWalletV2BulkEvmStateItem = {
	username: string;
	provider: SocialProvider;
	platformData: BagsSocialProviderUserData | null;
	wallet: string | null;
	chain: 'EVM';
};

export type BagsGetFeeShareWalletV2BulkStateItem = BagsGetFeeShareWalletV2BulkSolStateItem | BagsGetFeeShareWalletV2BulkEvmStateItem;

export type TokenClaimEvent = {
	wallet: string;
	isCreator: boolean;
	amount: string;
	signature: string;
	timestamp: number;
};

export type GetTokenClaimEventsSuccessResponse = {
	events: Array<TokenClaimEvent>;
};

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
	amount: string;
	decimals: number;
	uiAmount: number | null;
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
	token: string;
	lifetimeFees: string;
	tokenInfo: JupiterToken | null;
	creators: Array<TokenLaunchCreator> | null;
	tokenSupply: TokenAmount | null;
	tokenLatestPrice: TokenLatestPrice | null;
};

export type TransferFeeShareAdminParams = {
	baseMint: PublicKey;
	currentAdmin: PublicKey;
	newAdmin: PublicKey;
	payer: PublicKey;
};

export type UpdateFeeShareConfigParams = {
	feeClaimers: Array<BagsFeeClaimer>;
	payer: PublicKey;
	baseMint: PublicKey;
	additionalLookupTables?: Array<PublicKey>;
};
