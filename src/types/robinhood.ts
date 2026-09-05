export type RobinhoodProtocolVersion = 'v1' | 'v2' | 'v3';

export interface RobinhoodTokenMetadata {
	image: string | null;
	description: string | null;
}

/** Settlement asset of a launch: WETH for V1/V2 and native V3 launches, or an allowlisted ERC20 for a V3 launch that opted into one. */
export interface RobinhoodQuoteAsset {
	address: string;
	symbol: string;
	decimals: number;
	isNative: boolean;
}

/** Per-side V3 fee rates for a launch. Not present on V1/V2 launches, which always charge the fixed 2% protocol fee. */
export interface RobinhoodFeeConfig {
	buyFeeBps: number;
	sellFeeBps: number;
	protocolBuyFeeBps: number;
	protocolSellFeeBps: number;
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
	quote: RobinhoodQuoteAsset;
	fees?: RobinhoodFeeConfig;
}

export interface RobinhoodTopVolumeItem extends RobinhoodToken {
	priceEthPerToken: string | null;
	priceQuotePerToken: string | null;
	bondingProgressPct: number;
	volumeEthWei: string;
	volumeQuoteWei: string;
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
	quote: RobinhoodQuoteAsset;
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
	/** True for WETH-quoted launches (V1, V2, and native V3 launches); false for a V3 launch quoted in an ERC20, whose fee-share pays out the ERC20 directly. */
	unwrap: boolean;
	quote: RobinhoodQuoteAsset;
	transactions: Array<RobinhoodClaimTransaction>;
}

export interface CreateRobinhoodClaimTransactionsParams {
	tokenAddress: string;
	owner: string;
}
