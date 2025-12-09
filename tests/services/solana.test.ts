import { beforeAll, describe, expect, test } from 'vitest';
import { getTestSdk } from '../helpers/sdk';
import type { SolanaService } from '../../src/services/solana';
import type { JitoTipResponse } from '../../src/types/solana';

let solanaService: SolanaService;
let jitoTipSnapshot: JitoTipResponse;

beforeAll(async () => {
	solanaService = getTestSdk().solana;
	jitoTipSnapshot = await solanaService.getJitoRecentFees();
});

describe('SolanaService integration', () => {
	test('getJitoRecentFees returns Jito tip percentile metrics', () => {
		expect(jitoTipSnapshot).toBeDefined();
		expect(typeof jitoTipSnapshot.time).toBe('string');
		expect(jitoTipSnapshot.time.length).toBeGreaterThan(0);

		expect(Number.isFinite(jitoTipSnapshot.landed_tips_25th_percentile)).toBe(true);
		expect(Number.isFinite(jitoTipSnapshot.landed_tips_50th_percentile)).toBe(true);
		expect(Number.isFinite(jitoTipSnapshot.landed_tips_75th_percentile)).toBe(true);
		expect(Number.isFinite(jitoTipSnapshot.landed_tips_95th_percentile)).toBe(true);
		expect(Number.isFinite(jitoTipSnapshot.landed_tips_99th_percentile)).toBe(true);
		expect(Number.isFinite(jitoTipSnapshot.ema_landed_tips_50th_percentile)).toBe(true);

		expect(jitoTipSnapshot.landed_tips_25th_percentile).toBeGreaterThanOrEqual(0);
		expect(jitoTipSnapshot.landed_tips_50th_percentile).toBeGreaterThanOrEqual(0);
		expect(jitoTipSnapshot.landed_tips_75th_percentile).toBeGreaterThanOrEqual(0);
		expect(jitoTipSnapshot.landed_tips_95th_percentile).toBeGreaterThanOrEqual(0);
		expect(jitoTipSnapshot.landed_tips_99th_percentile).toBeGreaterThanOrEqual(0);
		expect(jitoTipSnapshot.ema_landed_tips_50th_percentile).toBeGreaterThanOrEqual(0);
	});
});

