export const JITO_REGIONS = ['mainnet', 'amsterdam', 'frankfurt', 'ny', 'tokyo', 'slc', 'london', 'singapore'] as const;

export type JitoRegion = (typeof JITO_REGIONS)[number];

export interface SendBundleRequestPayload {
	transactions: Array<string>;
	region: JitoRegion;
}

export interface BundleStatus {
	bundle_id: string;
	transactions: Array<string>;
	slot: number;
	confirmation_status: string;
	err: Record<string, unknown> | null;
}

export interface BundleStatusesResponse {
	context: {
		slot: number;
	};
	value: Array<BundleStatus>;
}

export interface JitoTipResponse {
	time: string;
	landed_tips_25th_percentile: number;
	landed_tips_50th_percentile: number;
	landed_tips_75th_percentile: number;
	landed_tips_95th_percentile: number;
	landed_tips_99th_percentile: number;
	ema_landed_tips_50th_percentile: number;
}
