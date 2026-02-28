import type { PublicKey } from '@solana/web3.js';

export interface DexscreenerOrderLink {
	url: string;
	label?: string;
}

export type CheckDexscreenerOrderAvailabilityParams = {
	tokenAddress: PublicKey;
};

export interface CheckDexscreenerOrderAvailabilityResponse {
	available: boolean;
}

export type CreateDexscreenerOrderParams = {
	tokenAddress: PublicKey;
	description: string;
	iconImageUrl: string;
	headerImageUrl: string;
	payerWallet: PublicKey;
	links?: Array<DexscreenerOrderLink>;
	payWithSol?: boolean;
};

export type NormalizedCreateDexscreenerOrderParams = {
	tokenAddress: string;
	description: string;
	iconImageUrl: string;
	headerImageUrl: string;
	payerWallet: string;
	links?: Array<DexscreenerOrderLink>;
	payWithSol?: boolean;
};

export interface CreateDexscreenerOrderResponse {
	orderUUID: string;
	recipientWallet: string;
	priceUSDC: number;
	transaction: string;
	lastValidBlockHeight: number;
}

export type SubmitDexscreenerPaymentParams = {
	orderUUID: string;
	paymentSignature: string;
};
