import { PublicKey } from '@solana/web3.js';

/** One constituent mint and its bps weight, for writing a dividend basket. */
export interface DividendConstituentInput {
	mint: PublicKey;
	/** Basis-point share, integers >= 100. All entries in a basket must sum to exactly 10000. */
	bps: number;
}

export interface DividendConstituentView {
	/** Base58 constituent mint. Case-sensitive. */
	mint: string;
	bps: number;
	decimals: number;
	tokenProgram: string;
	/** Token-2022 extension names present on the mint. */
	extensions: string[];
	/** True for the native-SOL passthrough constituent: no swap, paid out as lamports. */
	isNativeSol: boolean;
	name: string | null;
	symbol: string | null;
	image: string | null;
}

export interface DividendProfileStatsView {
	completedDistributions: number;
	totalClaimedLamports: string;
	totalDistributedLamports: string;
	lastDistributionAt: string | null;
}

export interface DividendProfileView {
	tokenMint: string;
	status: 'active' | 'disabled';
	/** Monotonic config version. Bumped by the backend on every accepted change. */
	version: number;
	/** Informational: the size of the @DividendsBot fee-share row the frontend created. */
	botFeeShareBps: number | null;
	constituents: DividendConstituentView[];
	/** Bot-maintained rollup. */
	stats: DividendProfileStatsView;
	createdAt: string;
	updatedAt: string;
}

export type GetDividendProfileBulkResponse = Array<DividendProfileView | null>;

export type DividendPhase =
	| 'idle'
	| 'claiming'
	| 'awaiting_funds'
	| 'snapshotting_holders'
	| 'buying_constituents'
	| 'paying_holders'
	| 'awaiting_recipients'
	| 'awaiting_route'
	| 'retrying'
	| 'needs_review'
	| 'completed';

export interface DividendCurrentCycle {
	/** The hourly cron slot, floor(now, 1h).toISOString(). */
	cycleId: string;
	claimStatus: string;
	distributionStatus: string | null;
	updatedAt: string;
}

export interface GetDividendStatusResponse {
	phase: DividendPhase;
	/** The current profile, carrying the bot's stats rollup, or null when the token has none. */
	profile: DividendProfileView | null;
	/** The latest cycle the bot worked on for this token; null when it has never run. */
	currentCycle: DividendCurrentCycle | null;
}

export interface DividendHistoryClaim {
	/** Base58 claim signature, or null when unavailable. */
	signature: string | null;
	claimedLamports: string;
	slot: number | null;
	confirmedAt: string | null;
}

export interface DividendHistoryBuy {
	mint: string;
	symbol: string | null;
	image: string | null;
	decimals: number;
	/** The bps this cycle actually used, which may differ from the current profile. */
	weightBpsUsed: number;
	lamportsIn: string;
	boughtAmountRaw: string | null;
	/** True for the native-SOL passthrough slice: no swap happened. */
	isNativeSol: boolean;
	signature: string | null;
	confirmedAt: string | null;
}

export interface DividendHistorySnapshot {
	holderCount: number | null;
	/** Distinct owners with at least one confirmed transfer. */
	recipientCount: number;
	excludedHolderCount: number;
	includedSupply: string;
	slot: number | null;
	capturedAt: string | null;
	/** True when the rent-budget shrink dropped the lowest-balance holders. */
	truncated: boolean;
}

export interface DividendHistoryDistribution {
	totalLamports: string;
	distributableLamports: string;
	/** ATA rent + wallet floor withheld from the claim before buying. */
	reserveLamports: string;
	snapshot: DividendHistorySnapshot;
	/** Confirmed payout signatures in execution order. */
	payoutSignatures: string[];
	completedAt: string;
}

export interface DividendHistoryRecipient {
	wallet: string;
	snapshotBalanceRaw: string;
	/** Empty when integer pro-rata rounded every constituent to zero. */
	amounts: Array<{ mint: string; amountRaw: string }>;
}

export interface DividendHistoryItem {
	/** Distribution ObjectId; stable feed-item id and the pagination cursor. */
	id: string;
	/** ISO-8601 distribution creation time used for feed ordering. */
	timestamp: string;
	/** One distribution aggregates every claim confirmed in its hourly cycle. */
	claims: DividendHistoryClaim[];
	buys: DividendHistoryBuy[];
	distribution: DividendHistoryDistribution;
	/** Up to ten non-excluded holders ranked by snapshot balance. */
	topRecipients: DividendHistoryRecipient[];
}

export interface GetDividendHistoryParams {
	tokenMint: PublicKey;
	/** Page size, 1-50. Defaults to 20 server-side. */
	limit?: number;
	/** Cursor from a previous response's `nextCursor`. Omit for the first page. */
	cursor?: string;
}

export interface GetDividendHistoryResponse {
	/** Completed cycles, newest first. */
	items: DividendHistoryItem[];
	/** Whether another page exists after this page. */
	hasMore: boolean;
	/** Distribution ObjectId to send as cursor, or null when this is the final page. */
	nextCursor: string | null;
}
