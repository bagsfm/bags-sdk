import { describe, expect, test } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import { BAGS_FEE_SHARE_V1_PROGRAM_ID, BAGS_FEE_SHARE_V2_PROGRAM_ID, METEORA_DAMM_V2_PROGRAM_ID, METEORA_DBC_PROGRAM_ID } from '../../src/constants';

describe('StateService integration', () => {
	test('getTokenLifetimeFees returns a non-negative number', async () => {
		const { state } = getTestSdk();
		const fees = await state.getTokenLifetimeFees(testEnv.tokenMint);

		expect(typeof fees).toBe('number');
		expect(Number.isFinite(fees)).toBe(true);
		expect(fees).toBeGreaterThanOrEqual(0);
	});

	test('getTokenCreators resolves creator metadata', async () => {
		const { state } = getTestSdk();
		const creators = await state.getTokenCreators(testEnv.tokenMint);

		expect(Array.isArray(creators)).toBe(true);
		expect(creators.length).toBeGreaterThan(0);

		const [first] = creators;
		expect(first).toHaveProperty('wallet');
		expect(typeof first.wallet).toBe('string');
	});

	test('getLaunchWallet methods return consistent public keys', async () => {
		const { state } = getTestSdk();
		const legacyWallet = await state.getLaunchWalletForTwitterUsername(testEnv.socialUsername);
		const v2Result = await state.getLaunchWalletV2(testEnv.socialUsername, 'twitter');

		expect(legacyWallet).toBeInstanceOf(PublicKey);
		expect(v2Result.wallet).toBeInstanceOf(PublicKey);
		expect(v2Result.provider).toBe('twitter');
		expect(v2Result.wallet.equals(legacyWallet)).toBe(true);
	});

	test('getLaunchWalletV2Bulk returns consistent results with the single fetch', async () => {
		const { state } = getTestSdk();
		const legacyWallet = await state.getLaunchWalletForTwitterUsername(testEnv.socialUsername);
		const [bulkResult] = await state.getLaunchWalletV2Bulk([{ username: testEnv.socialUsername, provider: 'twitter' }]);
		const singleResult = await state.getLaunchWalletV2(testEnv.socialUsername, 'twitter');

		expect(bulkResult).toBeDefined();
		expect(bulkResult.provider).toBe('twitter');
		expect(bulkResult.wallet).not.toBeNull();
		expect(bulkResult.wallet).toBeInstanceOf(PublicKey);
		expect(bulkResult.wallet?.equals(singleResult.wallet)).toBe(true);
		expect(bulkResult.wallet?.equals(legacyWallet)).toBe(true);
	});

	test('program getters expose expected program ids', () => {
		const { state } = getTestSdk();

		expect(state.getDbcProgram().programId.toBase58()).toBe(METEORA_DBC_PROGRAM_ID);
		expect(state.getDammV2Program().programId.toBase58()).toBe(METEORA_DAMM_V2_PROGRAM_ID);
		expect(state.getBagsMeteoraFeeClaimerProgram().programId.toBase58()).toBe(BAGS_FEE_SHARE_V1_PROGRAM_ID);
		expect(state.getBagsFeeShareV2Program().programId.toBase58()).toBe(BAGS_FEE_SHARE_V2_PROGRAM_ID);
	});

	test('getBagsApiClient exposes the underlying HTTP client', () => {
		const { state } = getTestSdk();
		expect(state.getBagsApiClient()).toBeDefined();
	});

	test('getTopTokensByLifetimeFees returns at least one item with a valid token public key', async () => {
		const { state } = getTestSdk();
		const items = await state.getTopTokensByLifetimeFees();

		expect(Array.isArray(items)).toBe(true);
		expect(items.length).toBeGreaterThan(0);

		const [first] = items;
		expect(typeof first.token).toBe('string');
		expect(() => new PublicKey(first.token)).not.toThrow();
	});

	test('getTokenClaimStats returns claim stats keyed to the requested token mint', async () => {
		const { state } = getTestSdk();
		const stats = await state.getTokenClaimStats(testEnv.tokenMint);

		expect(Array.isArray(stats)).toBe(true);
		expect(stats.length).toBeGreaterThan(0);

		const expectedMint = testEnv.tokenMint.toBase58();

		for (const entry of stats) {
			expect(typeof entry.wallet).toBe('string');
			expect(() => new PublicKey(entry.wallet)).not.toThrow();

			expect(typeof entry.tokenMint).toBe('string');
			expect(entry.tokenMint).toBe(expectedMint);

			expect(typeof entry.totalClaimed).toBe('string');
			expect(Number.isFinite(Number(entry.totalClaimed))).toBe(true);
			expect(Number(entry.totalClaimed)).toBeGreaterThanOrEqual(0);
		}
	});

	test('getGlobalClaimFeedV2 returns claim events newest first with per-mint denomination', async () => {
		const { state } = getTestSdk();
		const feed = await state.getGlobalClaimFeedV2({ limit: 10 });

		expect(Array.isArray(feed.events)).toBe(true);
		expect(typeof feed.hasMore).toBe('boolean');
		expect(feed.events.length).toBeGreaterThan(0);
		expect(feed.events.length).toBeLessThanOrEqual(10);

		for (const event of feed.events) {
			expect(() => new PublicKey(event.tokenMint)).not.toThrow();
			expect(() => new PublicKey(event.wallet)).not.toThrow();
			expect(() => new PublicKey(event.mint)).not.toThrow();

			expect(typeof event.amount).toBe('string');
			expect(Number(event.amount)).toBeGreaterThan(0);

			expect(Number.isInteger(event.decimals)).toBe(true);
			expect(typeof event.signature).toBe('string');
			expect(Number.isInteger(event.timestamp)).toBe(true);
			expect(typeof event.isFirstClaim).toBe('boolean');

			if (event.amountUsd !== null) {
				expect(typeof event.amountUsd).toBe('number');
			}
		}

		const timestamps = feed.events.map((event) => event.timestamp);
		const sortedDescending = [...timestamps].sort((a, b) => b - a);
		expect(timestamps).toEqual(sortedDescending);
	});

	test('getGlobalClaimFeedV2 pages backwards with the before cursor', async () => {
		const { state } = getTestSdk();
		const first = await state.getGlobalClaimFeedV2({ limit: 5 });

		expect(first.events.length).toBeGreaterThan(0);

		const cursor = first.events[first.events.length - 1].timestamp;
		const next = await state.getGlobalClaimFeedV2({ limit: 5, before: cursor });

		for (const event of next.events) {
			expect(event.timestamp).toBeLessThan(cursor);
		}
	});

	test('getGlobalClaimFeedV2 rejects an out-of-range limit', async () => {
		const { state } = getTestSdk();

		await expect(state.getGlobalClaimFeedV2({ limit: 0 })).rejects.toThrow();
		await expect(state.getGlobalClaimFeedV2({ limit: 101 })).rejects.toThrow();
	});
});

