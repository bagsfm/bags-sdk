import { PositionState } from '@meteora-ag/cp-amm-sdk';
import { PublicKey } from '@solana/web3.js';

// feeClaimer and tokenMint are required
// Everything else depends, if claimVirtualPoolFees is true, virtualPoolAddress is required
// If claimDammV2Fees is true, dammV2Position, dammV2Pool, dammV2PositionNftAccount, tokenAMint, tokenBMint, tokenAVault, tokenBVault are required
export interface GetClaimTransactionForTokenRequest {
	feeClaimer: string;
	tokenMint: string;

	isCustomFeeVault: boolean;

	claimVirtualPoolFees?: boolean;
	claimDammV2Fees?: boolean;

	virtualPoolAddress?: string;
	dammV2Position?: string;
	dammV2Pool?: string;
	dammV2PositionNftAccount?: string;
	tokenAMint?: string;
	tokenBMint?: string;
	tokenAVault?: string;
	tokenBVault?: string;

	customFeeVaultClaimerA?: string;
	customFeeVaultClaimerB?: string;
	customFeeVaultClaimerSide?: 'A' | 'B';
}

export interface CustomFeeVault {
	claimerA: PublicKey;
	claimerB: PublicKey;
	claimerABps: number;
	claimerBBps: number;
	mint: PublicKey;
	bump: number;
}

export type MeteoraDbcClaimPositionFeeParams = {
	owner: PublicKey;
	position: PublicKey;
	pool: PublicKey;
	positionNftAccount: PublicKey;
	tokenAMint: PublicKey;
	tokenBMint: PublicKey;
	tokenAVault: PublicKey;
	tokenBVault: PublicKey;
	tokenAProgram: PublicKey;
	tokenBProgram: PublicKey;
};

export type MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault = MeteoraDbcClaimablePosition | MeteoraDbcClaimablePositionWithCustomFeeVault;

type MeteoraDbcClaimablePosition = {
	isCustomFeeVault: false;
	virtualPool: string;
	baseMint: string;
	virtualPoolClaimableAmount: number;
	dammPoolClaimableAmount?: number;
	virtualPoolAddress: string;
	isMigrated: boolean;
	dammPoolAddress?: string;
	dammPositionInfo?: MeteoraDbcClaimPositionFeeParams;
	claimableDisplayAmount: number;
};

type MeteoraDbcClaimablePositionWithCustomFeeVault = {
	isCustomFeeVault: true;
	customFeeVault: PublicKey;
	customFeeVaultBalance: number;
	customFeeVaultBps: number;
	customFeeVaultClaimOwner: PublicKey;
	customFeeVaultClaimerA: PublicKey;
	customFeeVaultClaimerB: PublicKey;
	customFeeVaultClaimerSide: 'A' | 'B';
	virtualPool: string;
	baseMint: string;
	virtualPoolClaimableAmount: number;
	dammPoolClaimableAmount?: number;
	virtualPoolAddress: string;
	isMigrated: boolean;
	dammPoolAddress?: string;
	dammPositionInfo?: MeteoraDbcClaimPositionFeeParams;
	claimableDisplayAmount: number;
};

export interface DammV2PositionByPool {
	positionNftAccount: PublicKey;
	position: PublicKey;
	positionState: PositionState;
}
