import type { PublicKey, VersionedTransaction } from '@solana/web3.js';

export type TradeSlippageMode = 'manual' | 'auto';

export type GetTradeQuoteParams = {
	inputMint: PublicKey;
	outputMint: PublicKey;
	amount: number;
	slippageMode?: TradeSlippageMode;
	slippageBps?: number;
};

export type NormalizedGetTradeQuoteParams = {
	inputMint: string;
	outputMint: string;
	amount: number;
	slippageMode: TradeSlippageMode;
	slippageBps?: number;
};

export interface TradeQuotePlatformFee {
	amount: string;
	feeAccount: string;
	feeBps: number;
	segmenterFeeAmount: string;
	segmenterFeePct: number;
}

export interface TradeQuoteRoutePlanLeg {
	data: string;
	inAmount: string;
	inputMint: string;
	inputMintDecimals: number;
	marketKey: string;
	outAmount: string;
	outputMint: string;
	outputMintDecimals: number;
	venue: string;
}

export interface TradeQuoteResponse {
	contextSlot: number;
	inAmount: string;
	inputMint: string;
	minOutAmount: string;
	otherAmountThreshold: string;
	outAmount: string;
	outputMint: string;
	priceImpactPct: string;
	routePlan: Array<TradeQuoteRoutePlanLeg>;
	slippageBps: number;
	outTransferFee?: string;
	platformFee?: TradeQuotePlatformFee;
	requestId: string;
	simulatedComputeUnits: number | null;
}

export type CreateSwapTransactionParams = {
	quoteResponse: TradeQuoteResponse;
	userPublicKey: PublicKey;
};

export type NormalizedCreateSwapTransactionParams = {
	quoteResponse: TradeQuoteResponse;
	userPublicKey: string;
};

export interface TradeSwapTransactionResponse {
	computeUnitLimit: number;
	lastValidBlockHeight: number;
	prioritizationFeeLamports: number;
	swapTransaction: string;
}

export type CreateSwapTransactionResult = {
	transaction: VersionedTransaction;
	computeUnitLimit: number;
	lastValidBlockHeight: number;
	prioritizationFeeLamports: number;
};

export type TradeV2Provider = 'auto' | 'jupiter' | 'titan';

export type TradeV2ProviderServed = 'jupiter' | 'titan';

export type TradeV2TransactionSpeed = 'normal' | 'fast' | 'turbo';

/** Which leg pays the fee: 'input' is deducted from amount before the quote, 'output' is skimmed from the quoted proceeds. */
export type TradeV2FeeSide = 'input' | 'output';

export type GetTradeV2QuoteParams = {
	inputMint: PublicKey;
	outputMint: PublicKey;
	taker: PublicKey;
	amount: string;
	slippageBps?: number | 'auto';
	transactionSpeed?: TradeV2TransactionSpeed;
	provider?: TradeV2Provider;
};

export type NormalizedGetTradeV2QuoteParams = {
	inputMint: string;
	outputMint: string;
	taker: string;
	amount: string;
	slippageBps?: number | 'auto';
	transactionSpeed?: TradeV2TransactionSpeed;
	provider?: TradeV2Provider;
};

export interface TradeV2QuoteResponse {
	requestId: string;
	provider: TradeV2ProviderServed;
	inputMint: string;
	outputMint: string;
	inAmount: string;
	outAmount: string;
	slippageBps: number;
	/** Mint the fee is charged in: native SOL wins, else a preferred stablecoin/LST mint, else the input mint. */
	feeMint: string;
	feeSide: TradeV2FeeSide;
	/** Bags treasury fee in raw base units of feeMint (only lamports when feeMint is native SOL). */
	feeLamports: string;
	expiresAtMs: number | null;
}

export type CreateTradeV2SwapParams = {
	requestId: string;
	userPublicKey: PublicKey;
};

export type NormalizedCreateTradeV2SwapParams = {
	requestId: string;
	userPublicKey: string;
};

export interface TradeV2SwapTransactionResponse {
	swapTransaction: string;
	computeUnitLimit: number;
	prioritizationFeeLamports: number;
	lastValidBlockHeight: number;
	feeMint: string;
	feeSide: TradeV2FeeSide;
	feeLamports: string;
	revenueLamports: string;
	provider: TradeV2ProviderServed;
}

export type CreateTradeV2SwapResult = {
	transaction: VersionedTransaction;
	computeUnitLimit: number;
	prioritizationFeeLamports: number;
	lastValidBlockHeight: number;
	feeMint: string;
	feeSide: TradeV2FeeSide;
	feeLamports: string;
	revenueLamports: string;
	provider: TradeV2ProviderServed;
};
