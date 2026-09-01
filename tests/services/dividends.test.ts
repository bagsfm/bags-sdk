import { describe, expect, test } from 'vitest';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';

describe('DividendsService', () => {
	test('getProfile returns a profile or null for a known mint', async () => {
		const sdk = getTestSdk();
		const profile = await sdk.dividends.getProfile(testEnv.tokenMint);

		if (profile) {
			expect(profile.tokenMint).toBe(testEnv.tokenMint.toBase58());
			expect(['active', 'disabled']).toContain(profile.status);
			expect(Array.isArray(profile.constituents)).toBe(true);
		} else {
			expect(profile).toBeNull();
		}
	});

	test('getProfilesBulk returns one entry per input mint, in order', async () => {
		const sdk = getTestSdk();
		const profiles = await sdk.dividends.getProfilesBulk([testEnv.tokenMint, testEnv.notUsedBagsTokenMint]);

		expect(profiles.length).toBe(2);
		expect(profiles[1]).toBeNull();
	});

	test('getStatus returns a live phase for a known mint', async () => {
		const sdk = getTestSdk();
		const status = await sdk.dividends.getStatus(testEnv.tokenMint);

		expect(typeof status.phase).toBe('string');
		expect(status.profile === null || typeof status.profile === 'object').toBe(true);
		expect(status.currentCycle === null || typeof status.currentCycle === 'object').toBe(true);
	});

	test('getStatus returns idle for a mint with no dividend activity', async () => {
		const sdk = getTestSdk();
		const status = await sdk.dividends.getStatus(testEnv.notUsedBagsTokenMint);

		expect(status.phase).toBe('idle');
		expect(status.profile).toBeNull();
		expect(status.currentCycle).toBeNull();
	});

	test('getHistory returns a paginated page of completed cycles', async () => {
		const sdk = getTestSdk();
		const page = await sdk.dividends.getHistory({ tokenMint: testEnv.tokenMint, limit: 5 });

		expect(Array.isArray(page.items)).toBe(true);
		expect(page.items.length).toBeLessThanOrEqual(5);
		expect(typeof page.hasMore).toBe('boolean');

		if (page.items.length > 0) {
			const [first] = page.items;
			expect(typeof first.id).toBe('string');
			expect(Array.isArray(first.claims)).toBe(true);
			expect(Array.isArray(first.buys)).toBe(true);
		}
	});

	test('getHistory returns an empty page for a mint with no dividend activity', async () => {
		const sdk = getTestSdk();
		const page = await sdk.dividends.getHistory({ tokenMint: testEnv.notUsedBagsTokenMint });

		expect(page.items).toEqual([]);
		expect(page.hasMore).toBe(false);
		expect(page.nextCursor).toBeNull();
	});
});
