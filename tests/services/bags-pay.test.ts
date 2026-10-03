import { describe, expect, test } from 'vitest';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import type { BagsPayService } from '../../src/services/bags-pay';

let bagsPayService: BagsPayService;

describe('BagsPayService integration', () => {
	test('getToken returns a mapping or null', async () => {
		bagsPayService = getTestSdk().bagsPay;
		const result = await bagsPayService.getToken(testEnv.tokenMint);

		if (result !== null) {
			expect(result.tokenMint).toBe(testEnv.tokenMint.toBase58());
			expect(typeof result.vaultOwnerWallet).toBe('string');
			expect(typeof result.stats.totalClaimedLamports).toBe('string');
		}
	});

	test('getTokensBulk returns an array aligned to the requested mints', async () => {
		bagsPayService = getTestSdk().bagsPay;
		const result = await bagsPayService.getTokensBulk([testEnv.tokenMint, testEnv.notUsedBagsTokenMint]);

		expect(result).toHaveLength(2);
	});

	test('getTokensBulk rejects an empty list', async () => {
		bagsPayService = getTestSdk().bagsPay;
		await expect(bagsPayService.getTokensBulk([])).rejects.toThrow('between 1 and 100');
	});

	test('getStatus returns a phase', async () => {
		bagsPayService = getTestSdk().bagsPay;
		const result = await bagsPayService.getStatus(testEnv.tokenMint);

		expect(typeof result.phase).toBe('string');
		expect(result).toHaveProperty('currentDistribution');
	});

	test('getHistory returns a page of distributions', async () => {
		bagsPayService = getTestSdk().bagsPay;
		const result = await bagsPayService.getHistory(testEnv.tokenMint, { limit: 5 });

		expect(Array.isArray(result.items)).toBe(true);
		expect(result.items.length).toBeLessThanOrEqual(5);
		expect(typeof result.hasMore).toBe('boolean');
	});
});
