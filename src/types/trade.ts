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
