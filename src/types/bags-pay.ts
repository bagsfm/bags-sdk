/** Amounts are base-10 decimal strings: lamports for `*Lamports`, raw token units for `*Raw`. */
export type BagsPayTokenStatus = 'active' | 'disabled';
export type BagsPayPayoutMode = 'vault' | 'reserved';
export type BagsPayVaultDepositStatus = 'pending' | 'sent' | 'confirmed' | 'skipped' | 'manual_review' | 'reserved' | 'released';
export type BagsPayBuybackStatus = 'pending' | 'deferred' | 'buying' | 'bought' | 'airdropping' | 'completed' | 'skipped' | 'manual_review';
export type BagsPayBuybackDeferReason = 'no_route' | 'price_impact' | 'no_eligible_holders' | 'insufficient_float' | 'quote_failed' | 'unsupported_mint';
export type BagsPayReserveReason = 'no_metadata_twitter' | 'x_account_not_found' | 'invalid_payee_wallet';
export type BagsPayFeedDistributionStatus = 'completed' | 'processing' | 'manual_review';
export type BagsPayPhase =
	| 'not_enabled'
	| 'disabled'
	| 'idle'
	| 'claiming'
	| 'depositing'
	| 'buying'
	| 'buyback_deferred'
	| 'airdropping'
	| 'settling'
	| 'needs_review'
	| 'reserved';

export interface BagsPayTokenStats {
	totalClaimedLamports: string;
	confirmedClaimCount: number;
	/** Paid to the payee's vault. */
	totalVaultDepositedLamports: string;
	/** SOL spent on buybacks. */
	totalBuybackLamports: string;
	totalBoughtRaw: string;
	totalAirdroppedRaw: string;
	distributionCount: number;
	completedDistributionCount: number;
	/** Vault shares held in reserve because the coin had no payee when claimed. '0' on older rows. */
	totalReservedLamports: string;
	/** 0 on older rows. */
	reservedDistributionCount: number;
	lastClaimAt: string | null;
	lastDistributionCompletedAt: string | null;
}

export interface BagsPayToken {
	tokenMint: string;
	status: BagsPayTokenStatus;
	/** Who created the mapping (e.g. `launch`, `metadata`). null on older rows. */
	source: string | null;
	payee: {
		/** X handle at resolution time (display); null when no payee was resolved. */
		xUsername: string | null;
		/** Numeric X user id; null when unknown. */
		xUserId: string | null;
	};
	/** Wallet whose claim vault receives the vault share of future claims. */
	vaultOwnerWallet: string;
	vaultPda: string;
	label: string | null;
	stats: BagsPayTokenStats;
	createdAt: string;
	updatedAt: string;
}

export interface BagsPayCurrentDistribution {
	id: string;
	status: 'pending' | 'processing' | 'manual_review';
	payoutMode: BagsPayPayoutMode;
	/** null until the distribution is split. */
	totalLamports: string | null;
	vaultStatus: BagsPayVaultDepositStatus | null;
	buybackStatus: BagsPayBuybackStatus | null;
	/** Only while `buybackStatus` is `deferred`. */
	deferReason: BagsPayBuybackDeferReason | null;
	/** Only while `buybackStatus` is `deferred`. */
	nextAttemptAt: string | null;
	/** null until the airdrop ledger exists. */
	airdrop: { confirmedTransferCount: number; transferCount: number; distributedRaw: string } | null;
	createdAt: string;
	updatedAt: string;
}

export interface BagsPayStatus {
	phase: BagsPayPhase;
	token: BagsPayToken | null;
	currentDistribution: BagsPayCurrentDistribution | null;
	lastCompletedDistribution: { id: string; completedAt: string } | null;
	/** Vault shares of this coin held in reserve; null when there are none. */
	reserve: { reservedLamports: string; reservedCount: number; lastReserveReason: BagsPayReserveReason | null } | null;
}

export interface BagsPayHistoryClaim {
	signature: string;
	claimedLamports: string;
	slot: number | null;
	confirmedAt: string | null;
}

export interface BagsPayHistoryItem {
	/** Distribution id: stable item id and pagination cursor. */
	id: string;
	timestamp: string;
	status: BagsPayFeedDistributionStatus;
	payoutMode: BagsPayPayoutMode;
	completedAt: string | null;
	claims: BagsPayHistoryClaim[];
	split: {
		totalLamports: string;
		vaultLamports: string;
		buybackLamports: string;
		vaultBps: number;
		buybackBps: number;
	};
	vaultDeposit: {
		status: BagsPayVaultDepositStatus;
		lamports: string;
		vaultOwnerWallet: string | null;
		vaultPda: string | null;
		reserveReason: BagsPayReserveReason | null;
		release: { kind: 'vault' | 'treasury'; releasedAt: string } | null;
		/** Only when the deposit landed. */
		signature: string | null;
		confirmedAt: string | null;
	};
	buyback: {
		status: BagsPayBuybackStatus;
		lamportsIn: string;
		boughtAmountRaw: string | null;
		decimals: number | null;
		symbol: string | null;
		image: string | null;
		/** Only when the swap landed. */
		signature: string | null;
		confirmedAt: string | null;
		/** A ratio: "0.0123" is 1.23%. */
		priceImpactPct: string | null;
		routeLabels: string[];
		deferReason: BagsPayBuybackDeferReason | null;
	};
	airdrop: {
		eligibleHolderCount: number | null;
		excludedHolderCount: number | null;
		includedSupplyRaw: string | null;
		snapshotTakenAt: string | null;
		truncatedByCap: boolean;
		recipientCount: number;
		distributedRaw: string;
		undeliverableCount: number;
		undeliverableRaw: string;
		payoutSignatures: string[];
	};
	topRecipients: Array<{ wallet: string; snapshotBalanceRaw: string; amountRaw: string | null }>;
}

export interface BagsPayHistory {
	items: BagsPayHistoryItem[];
	hasMore: boolean;
	nextCursor: string | null;
}

export interface GetBagsPayHistoryOptions {
	/** Page size, 1 to 50. Defaults to 20. */
	limit?: number;
	/** `nextCursor` from the previous page. */
	cursor?: string;
}
