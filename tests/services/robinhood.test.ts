import { beforeAll, describe, expect, test } from 'vitest';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import type { RobinhoodClaimablePositions, RobinhoodTopVolumeResponse } from '../../src/types';

describe('RobinhoodService getTopVolume', () => {
	let topVolume: RobinhoodTopVolumeResponse;

	beforeAll(async () => {
		topVolume = await getTestSdk().robinhood.getTopVolume();
	});

	test('returns tokens ranked by lifetime volume', () => {
		expect(Array.isArray(topVolume.items)).toBe(true);
		expect(topVolume.items.length).toBeLessThanOrEqual(100);

		const item = topVolume.items[0];

		if (!item) {
			return;
		}

		expect(typeof item.address).toBe('string');
		expect(typeof item.volumeEthWei).toBe('string');
		expect(typeof item.volumeQuoteWei).toBe('string');
		expect(typeof item.bondingProgressPct).toBe('number');
		expect(typeof item.quote.address).toBe('string');
		expect(typeof item.quote.symbol).toBe('string');
	});

	test('items are sorted by volumeEthWei descending', () => {
		for (let i = 1; i < topVolume.items.length; i++) {
			expect(BigInt(topVolume.items[i - 1].volumeEthWei) >= BigInt(topVolume.items[i].volumeEthWei)).toBe(true);
		}
	});
});

describe.skipIf(!testEnv.robinhoodOwner)('RobinhoodService integration', () => {
	let claimablePositions: RobinhoodClaimablePositions;

	beforeAll(async () => {
		claimablePositions = await getTestSdk().robinhood.getClaimablePositions(testEnv.robinhoodOwner);
	});

	test('getClaimablePositions returns positions and truncation state', () => {
		expect(Array.isArray(claimablePositions.positions)).toBe(true);
		expect(typeof claimablePositions.truncated).toBe('boolean');

		const position = claimablePositions.positions[0];

		if (position) {
			expect(typeof position.quote.address).toBe('string');
		}
	});

	test('createClaimTransactions returns unsigned EVM transactions', async () => {
		const position = claimablePositions.positions[0];

		if (!position) {
			throw new Error('No actionable Robinhood Chain claimable positions found');
		}

		const result = await getTestSdk().robinhood.createClaimTransactions({
			tokenAddress: position.token.address,
			owner: testEnv.robinhoodOwner,
		});

		expect(result.chainId).toBe(4663);
		expect(typeof result.unwrap).toBe('boolean');
		expect(typeof result.quote.address).toBe('string');
		expect(result.transactions.length).toBeGreaterThan(0);

		result.transactions.forEach((transaction) => {
			expect(transaction.chainId).toBe(4663);
			expect(transaction.from.toLowerCase()).toBe(testEnv.robinhoodOwner.toLowerCase());
			expect(transaction.value).toBe('0');
			expect(transaction.data).toMatch(/^0x/);
		});
	});
});
