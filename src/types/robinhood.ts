export type RobinhoodProtocolVersion = 'v1' | 'v2';

export interface RobinhoodTokenMetadata {
	image: string | null;
	description: string | null;
}

export interface RobinhoodToken {
	address: string;
	name: string;
	symbol: string;
	metadataURI: string;
	metadata: RobinhoodTokenMetadata | null;
	curve: string;
	feeShare: string;
	poolId: string;
	creator: string;
	partner: string | null;
	partnerFeeBps: number;
	createdAtBlock: number;
	createdAtTimestamp: number;
	txHash: string;
	migrated: boolean;
	migratedAtBlock: number | null;
	migratedAtTimestamp: number | null;
	version?: RobinhoodProtocolVersion;
}

export interface RobinhoodTopVolumeItem extends RobinhoodToken {
	priceEthPerToken: string | null;
	bondingProgressPct: number;
	/**
	 * Spot price change over the last 24h in percent units (e.g. `-12.34` means -12.34%).
	 * Baseline is the last trade at or before 24h ago, falling back to the curve's initial
	 * spot for tokens with no trade before that cutoff. Null only when `priceEthPerToken`
	 * is null (or the baseline could not be resolved) — 0 is a real "unchanged" value.
	 */
	priceChange24hPct: number | null;
	/** ETH-leg trade volume over the last 24h, in wei as a decimal string. */
	volume24hEthWei: string;
	volumeEthWei: string;
}

export interface RobinhoodTopVolumeResponse {
	items: Array<RobinhoodTopVolumeItem>;
}

export interface RobinhoodClaimablePosition {
	token: RobinhoodToken;
	feeShare: string;
	version: RobinhoodProtocolVersion;
	claimableWei: string;
	pendingWei: string;
	actionableWei: string;
	claimedWei: string;
	lifetimeWei: string;
	isClaimer: boolean;
	isPartner: boolean;
	userBps: number;
}

export interface RobinhoodClaimablePositions {
	positions: Array<RobinhoodClaimablePosition>;
	truncated: boolean;
}

export interface RobinhoodClaimTransaction {
	to: string;
	data: string;
	value: '0';
	from: string;
	chainId: 4663;
}

export interface RobinhoodClaimTransactions {
	token: string;
	feeShare: string;
	version: RobinhoodProtocolVersion;
	claimableWei: string;
	pendingWei: string;
	actionableWei: string;
	chainId: 4663;
	unwrap: true;
	transactions: Array<RobinhoodClaimTransaction>;
}

export interface CreateRobinhoodClaimTransactionsParams {
	tokenAddress: string;
	owner: string;
}
