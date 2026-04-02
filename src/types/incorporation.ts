import type { PublicKey, VersionedTransaction } from '@solana/web3.js';

export const INCORPORATION_CATEGORIES = ['RWA', 'AI', 'DEFI', 'INFRA', 'DEPIN', 'LEGAL', 'GAMING', 'NFT', 'MEME'] as const;
export type IncorporationCategory = (typeof INCORPORATION_CATEGORIES)[number];

export type IncorporationKycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export type StartPaymentParams = {
	payerWallet: PublicKey;
	payWithSol?: boolean;
};

export type NormalizedStartPaymentParams = {
	payerWallet: string;
	payWithSol?: boolean;
};

export interface StartPaymentApiResponse {
	orderUUID: string;
	recipientWallet: string;
	priceUSDC: string;
	transaction: string;
	lastValidBlockHeight: number;
}

export interface StartPaymentResult {
	orderUUID: string;
	recipientWallet: string;
	priceUSDC: string;
	transaction: VersionedTransaction;
	lastValidBlockHeight: number;
}

// --- incorporate ---

export interface IncorporationFounderParams {
	firstName: string;
	lastName: string;
	email: string;
	nationalityCountry: string;
	taxResidencyCountry: string;
	residentialAddress: string;
	shareBasisPoint: number;
}

export interface IncorporateParams {
	orderUUID: string;
	paymentSignature: string;
	projectName: string;
	tokenAddress: PublicKey;
	founders: IncorporationFounderParams[];
	category?: IncorporationCategory;
	twitterHandle?: string;
	incorporationShareBasisPoint: number;
	preferredCompanyNames: string[];
}

export type NormalizedIncorporateParams = {
	orderUUID: string;
	paymentSignature: string;
	projectName: string;
	tokenAddress: string;
	founders: IncorporationFounderParams[];
	category?: IncorporationCategory;
	twitterHandle?: string;
	incorporationShareBasisPoint: number;
	preferredCompanyNames: string[];
};

export interface IncorporationFounderPepResponse {
	isSelfPoliticallyExposed: boolean | null;
	selfPoliticalPositions: string | null;
	isCloseToPoliticallyExposed: boolean | null;
	closeToPoliticallyExposedFullName: string | null;
	closeToPoliticallyExposedPositions: string | null;
	closeToPoliticallyExposedRelationship: string | null;
	politicallyExposedDataUpdatedAt: string | null;
}

export interface IncorporationFounderResponse {
	founderId: string;
	firstName: string;
	lastName: string;
	kycUrl: string;
	kycStatus: IncorporationKycStatus;
	shareBasisPoint: number;
	formUrl: string | null;
	pep: IncorporationFounderPepResponse;
	ipAttributionAcknowledgedAt: string | null;
}

export interface IncorporateResponse {
	tokenAddress: string;
	incorporationStatus: string;
	founders: IncorporationFounderResponse[];
	incorporationShareBasisPoint: number;
	category: string | null;
	twitterHandle: string | null;
	preferredCompanyNames: string[];
}

// --- startIncorporation ---

export type StartIncorporationParams = {
	tokenAddress: PublicKey;
};

export interface StartIncorporationResponse {
	tokenAddress: string;
	incorporationStarted: boolean;
}

// --- list ---

export interface IncorporationListFounderResponse {
	id: string;
	firstName: string;
	lastName: string;
	kycStatus: IncorporationKycStatus;
	pepCompleted: boolean;
	ipAttributionAcknowledged: boolean;
	shareBasisPoint: number;
}

export interface IncorporationProjectResponse {
	tokenAddress: string;
	incorporationStatus: string;
	founders: IncorporationListFounderResponse[];
	incorporationShareBasisPoint: number;
	category: string | null;
	twitterHandle: string | null;
	createdAt: string;
	preferredCompanyNames: string[];
	isReadyForIncorporation: boolean;
}

// --- getDetails ---

export type GetIncorporationDetailsParams = {
	tokenAddress: PublicKey;
};

export interface IncorporationDetailsResponse {
	tokenAddress: string;
	incorporationStatus: string;
	incorporationShareBasisPoint: number;
	category: string | null;
	twitterHandle: string | null;
	createdAt: string;
	preferredCompanyNames: string[];
	isReadyForIncorporation: boolean;
}
