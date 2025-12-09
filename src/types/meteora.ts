// feeClaimer and tokenMint are required
// Everything else depends, if claimVirtualPoolFees is true, virtualPoolAddress is required

import { BAGS_FEE_SHARE_V1_PROGRAM_ID, BAGS_FEE_SHARE_V2_PROGRAM_ID } from '../constants';

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
	feeShareProgramId?: string;
}

export type MeteoraDbcClaimPositionFeeParams = {
	owner: string;
	position: string;
	pool: string;
	positionNftAccount: string;
	tokenAMint: string;
	tokenBMint: string;
	tokenAVault: string;
	tokenBVault: string;
	tokenAProgram: string;
	tokenBProgram: string;
};

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
	totalClaimableLamportsUserShare: number;
};

type MeteoraDbcClaimablePositionWithCustomFeeVault = {
	programId: typeof BAGS_FEE_SHARE_V1_PROGRAM_ID;
	isCustomFeeVault: true;
	customFeeVault: string;
	customFeeVaultBalance: number;
	customFeeVaultBps: number;
	customFeeVaultClaimOwner: string;
	customFeeVaultClaimerA: string;
	customFeeVaultClaimerB: string;
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
	totalClaimableLamportsUserShare: number;
};

export type MeteoraClaimablePositionWithCustomFeeVaultV2PreMigration = {
	programId: typeof BAGS_FEE_SHARE_V2_PROGRAM_ID;
	isCustomFeeVault: true;

	user: string;

	baseMint: string;
	quoteMint: string;
	isMigrated: false;

	claimerIndex: number;
	userBps: number;

	virtualPool: string;
	virtualPoolClaimableLamportsUserShare: number;

	totalClaimableLamportsUserShare: number;
};

export type MeteoraClaimablePositionWithCustomFeeVaultV2PostMigration = {
	programId: typeof BAGS_FEE_SHARE_V2_PROGRAM_ID;

	isCustomFeeVault: true;

	user: string;

	baseMint: string;
	quoteMint: string;
	isMigrated: true;

	claimerIndex: number;
	userBps: number;

	virtualPool: string;
	virtualPoolClaimableLamportsUserShare: number;

	dammPool: string;
	dammPoolClaimableLamportsUserShare: number;
	dammPositionInfo: MeteoraDbcClaimPositionFeeParams;

	totalClaimableLamportsUserShare: number;
};

type MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault = MeteoraDbcClaimablePosition | MeteoraDbcClaimablePositionWithCustomFeeVault;
type MeteoraDbcClaimablePositionWithCustomFeeVaultV2 = MeteoraClaimablePositionWithCustomFeeVaultV2PreMigration | MeteoraClaimablePositionWithCustomFeeVaultV2PostMigration;
export type BagsClaimablePosition = MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault | MeteoraDbcClaimablePositionWithCustomFeeVaultV2;
