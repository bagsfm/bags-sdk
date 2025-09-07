import { PublicKey } from '@solana/web3.js';
import type { ReStreamClientOptions } from './types/restream';

export const BAGS_PUBLIC_API_V2_DEFAULT_BASE_URL = 'https://public-api-v2.bags.fm/api/v1';
export const METEORA_DBC_PROGRAM_ID = new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN');
export const BAGS_TOKEN_CREATION_AUTHORITY = new PublicKey('BAGSB9TpGrZxQbEsrEznv5jXXdwyP6AXerN8aVRiAmcv');

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const METEORA_DBC_MIGRATION_DAMM_V2_CREATOR = new PublicKey('FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM');
export const BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT = 1398960;
export const BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED = 'vault';

/* Restream */
export const DEFAULT_RESTREAM_URL = 'wss://restream.bags.fm';
export const DEFAULT_RESTREAM_PING_INTERVAL_MS = 30_000;
export const DEFAULT_RESTREAM_MAX_SUBS = 50;
export const DEFAULT_RESTREAM_MAX_WILDCARD_SUBS = 5;
export const DEFAULT_RESTREAM_CONNECT_TIMEOUT_MS = 3_000;
export const DEFAULT_RESTREAM_RECONNECT = {
	enabled: true,
	initialDelayMs: 250,
	maxDelayMs: 10_000,
	factor: 1.8,
	jitter: 0.2,
};
export const DEFAULT_RESTREAM_CLIENT_OPTS: ReStreamClientOptions = {
	reconnect: DEFAULT_RESTREAM_RECONNECT,
	endpoint: DEFAULT_RESTREAM_URL,
	pingIntervalMs: DEFAULT_RESTREAM_PING_INTERVAL_MS,
	maxSubscriptions: DEFAULT_RESTREAM_MAX_SUBS,
	maxWildcardSubscriptions: DEFAULT_RESTREAM_MAX_WILDCARD_SUBS,
	connectTimeoutMs: DEFAULT_RESTREAM_CONNECT_TIMEOUT_MS,
};
export const RESTREAM_KNOWN_EVENTS = ['launchpad_launch'] as const;
