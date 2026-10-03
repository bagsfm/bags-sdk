export const BAGS_PAYOUT_CASHOUT_METHODS = ['venmo', 'cashapp', 'xmoney'] as const;
export type BagsPayoutCashoutMethod = (typeof BAGS_PAYOUT_CASHOUT_METHODS)[number];

export const BAGS_PAYOUT_STATUSES = [
	'pending',
	'bridging',
	'bridged',
	'listing',
	'awaiting_buyer',
	'matched',
	'partially_paid',
	'paid',
	'closed',
	'manual_review',
	'cancelled',
] as const;
export type BagsPayoutStatus = (typeof BAGS_PAYOUT_STATUSES)[number];

export const BAGS_PAYOUT_STATUS_GROUPS = ['in_progress', 'done', 'attention'] as const;
export type BagsPayoutStatusGroup = (typeof BAGS_PAYOUT_STATUS_GROUPS)[number];

export type BagsPayoutTokenStatus = 'active' | 'disabled';
export type BagsPayoutClaimStatus = 'sent' | 'confirmed' | 'failed' | 'expired' | 'manual_review';
export type BagsPayoutOrigin = 'claims' | 'carry';
export type BagsPayoutRelayLegState = 'pending' | 'sent' | 'deposited' | 'filled' | 'skipped' | 'manual_review';
export type BagsPayoutRelayAttemptOutcome = 'expired' | 'reverted' | 'refunded';
export type BagsPayoutManualReviewReason =
	| 'relay_failed'
	| 'relay_stuck'
	| 'relay_attempts_exhausted'
	| 'relay_measurement_failed'
	| 'relay_quote_rejected'
	| 'payee_registration_failed'
	| 'peer_tx_failed'
	| 'evm_tx_stuck'
	| 'insufficient_usdc'
	| 'order_inconsistent'
	| 'ledger_inconsistent'
	| 'operator';

/** Default and maximum page sizes of the history and claims endpoints. */
export const BAGS_PAYOUT_HISTORY_DEFAULT_LIMIT = 20;
export const BAGS_PAYOUT_HISTORY_MAX_LIMIT = 50;

/**
 * A payout handle as entered by the creator. Sent as `payoutCashout` with a fee-share config that names the payout
 * wallet, and as `cashout` to the manager-only cashout endpoint.
 */
export interface BagsPayoutCashoutInput {
	method: BagsPayoutCashoutMethod;
	/** Venmo username, Cash App cashtag or X username (1..64 chars), with or without the leading '@' / '$'. */
	username: string;
}

// Every amount is a base-10 decimal string: lamports for `*Lamports`, USDC base units (6 decimals) for `*Raw`,
// USD cents for `*Cents`. Dates are ISO strings; a missing value is `null`.

export interface BagsPayoutTokenStats {
	totalClaimedLamports: string;
	confirmedClaimCount: number;
	totalBridgedLamports: string;
	totalUsdcReceivedRaw: string;
	totalUsdcPaidRaw: string;
	totalFiatPaidCents: string;
	payoutCount: number;
	paidPayoutCount: number;
	openPayoutCount: number;
	lastClaimAt: string | null;
	lastPayoutAt: string | null;
	lastPaidAt: string | null;
}

/** Claimed fees not in a payout yet, per frozen cashout target. */
export interface BagsPayoutPendingClaims {
	cashoutMethod: BagsPayoutCashoutMethod;
	username: string;
	/** True while this handle is the token's active mapping. */
	isCurrentMapping: boolean;
	confirmedCount: number;
	confirmedLamports: string;
	inFlightCount: number;
	underReviewCount: number;
	oldestAt: string | null;
	newestAt: string | null;
}

export interface BagsPayoutTokenView {
	tokenMint: string;
	cashoutMethod: BagsPayoutCashoutMethod;
	/** 'Venmo' | 'Cash App' | 'X Money' */
	cashoutMethodLabel: string;
	username: string;
	status: BagsPayoutTokenStatus;
	/** Whether the on-chain fee-share config names the payout wallet as its only claimer; `null` when it could not be read. */
	paysPayoutBot: boolean | null;
	stats: BagsPayoutTokenStats;
	pendingClaims: BagsPayoutPendingClaims[];
	createdAt: string;
	updatedAt: string;
}

export interface BagsPayoutTimelineEntry {
	status: BagsPayoutStatus;
	at: string;
	note: string | null;
}

export interface BagsPayoutBridgeAttempt {
	outcome: BagsPayoutRelayAttemptOutcome;
	at: string;
	depositSignature: string | null;
	refundedLamports: string | null;
}

export interface BagsPayoutBridge {
	state: BagsPayoutRelayLegState;
	amountInLamports: string;
	expectedOutRaw: string | null;
	minimumOutRaw: string | null;
	usdcReceivedRaw: string | null;
	relayRequestId: string | null;
	depositSignature: string | null;
	depositConfirmedAt: string | null;
	depositFeeLamports: string | null;
	fillTxHashes: string[];
	filledAt: string | null;
	retries: number;
	attempts: BagsPayoutBridgeAttempt[];
}

export interface BagsPayoutFill {
	/** SIGNALED | FULFILLED | PRUNED | MANUALLY_RELEASED */
	status: string;
	amountRaw: string;
	fiatPaidCents: string | null;
	paidAt: string | null;
	signaledAt: string | null;
	fulfilledAt: string | null;
}

export interface BagsPayoutOrder {
	depositId: string | null;
	amountRaw: string | null;
	carryInRaw: string;
	filledRaw: string;
	pendingRaw: string;
	returnedRaw: string;
	createTxHash: string | null;
	accessPolicyTxHashes: string[];
	withdrawTxHashes: string[];
	carryInFromPayoutIds: string[];
	listedAt: string | null;
	closedAt: string | null;
	fills: BagsPayoutFill[];
}

/** A confirmed claim transaction that funded a payout. */
export interface BagsPayoutClaim {
	signature: string;
	claimedLamports: string;
	slot: number | null;
	confirmedAt: string | null;
}

export interface BagsPayoutHistoryItem {
	/** Payout id (24 hex), also the pagination cursor. */
	id: string;
	tokenMint: string;
	origin: BagsPayoutOrigin;
	status: BagsPayoutStatus;
	statusGroup: BagsPayoutStatusGroup;
	statusLabel: string;
	cashoutMethod: BagsPayoutCashoutMethod;
	username: string;
	claimCount: number;
	totalClaimedLamports: string;
	bridge: BagsPayoutBridge;
	order: BagsPayoutOrder;
	usdcPaidRaw: string;
	fiatPaidCents: string;
	carryOutRaw: string | null;
	carryAppliedToPayoutId: string | null;
	/** Populated by getPayout; `null` in history pages. */
	claims: BagsPayoutClaim[] | null;
	manualReviewReason: BagsPayoutManualReviewReason | null;
	timeline: BagsPayoutTimelineEntry[];
	createdAt: string;
	updatedAt: string;
	completedAt: string | null;
}

export interface BagsPayoutClaimHistoryItem {
	/** Claim row id (24 hex), also the pagination cursor. */
	id: string;
	tokenMint: string;
	status: BagsPayoutClaimStatus;
	signature: string | null;
	slot: number | null;
	expectedLamports: string;
	txIndex: number;
	txCount: number;
	claimedLamports: string | null;
	cashoutMethod: BagsPayoutCashoutMethod;
	username: string;
	payoutId: string | null;
	createdAt: string;
	confirmedAt: string | null;
}

export interface BagsPayoutPage<T> {
	items: T[];
	hasMore: boolean;
	/** Pass as `cursor` to get the next (older) page; `null` on the last page. */
	nextCursor: string | null;
}

export type BagsPayoutHistoryPage = BagsPayoutPage<BagsPayoutHistoryItem>;
export type BagsPayoutClaimsPage = BagsPayoutPage<BagsPayoutClaimHistoryItem>;

export interface SetBagsPayoutTokenCashoutParams {
	tokenMint: string;
	cashout: BagsPayoutCashoutInput;
}

export interface GetBagsPayoutHistoryParams {
	tokenMint: string;
	/** 1..50, default 20. */
	limit?: number;
	/** 24 hex id from a previous page's `nextCursor`. */
	cursor?: string;
	/** Payout statuses and/or groups (`in_progress`, `done`, `attention`); an array is sent comma-separated. */
	status?: string | Array<BagsPayoutStatus | BagsPayoutStatusGroup>;
}

export interface GetBagsPayoutClaimsParams {
	tokenMint: string;
	/** 1..50, default 20. */
	limit?: number;
	cursor?: string;
}
