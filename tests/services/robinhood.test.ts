import { beforeAll, describe, expect, test } from 'vitest';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import type { RobinhoodClaimablePositions } from '../../src/types';

describe.skipIf(!testEnv.robinhoodOwner)('RobinhoodService integration', () => {
	let claimablePositions: RobinhoodClaimablePositions;

	beforeAll(async () => {
		claimablePositions = await getTestSdk().robinhood.getClaimablePositions(testEnv.robinhoodOwner);
	});

	test('getClaimablePositions returns positions and truncation state', () => {
		expect(Array.isArray(claimablePositions.positions)).toBe(true);
		expect(typeof claimablePositions.truncated).toBe('boolean');
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
		expect(result.unwrap).toBe(true);
		expect(result.transactions.length).toBeGreaterThan(0);

		result.transactions.forEach((transaction) => {
			expect(transaction.chainId).toBe(4663);
			expect(transaction.from.toLowerCase()).toBe(testEnv.robinhoodOwner.toLowerCase());
			expect(transaction.value).toBe('0');
			expect(transaction.data).toMatch(/^0x/);
		});
	});
});
