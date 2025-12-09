import { beforeAll, describe, expect, test } from 'vitest';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import type { BagsClaimablePosition } from '../../src/types/meteora';
import { testEnv } from '../helpers/env';

let claimablePositions: Array<BagsClaimablePosition> = [];

beforeAll(async () => {
	const { fee } = getTestSdk();
	claimablePositions = await fee.getAllClaimablePositions(testEnv.feeWallet);
});

describe('FeesService integration', () => {
	test('getAllClaimablePositions returns positions array', () => {
		expect(Array.isArray(claimablePositions)).toBe(true);
	});

	test('getClaimTransaction returns executable transactions when positions exist', async () => {
		const { fee } = getTestSdk();

		if (claimablePositions.length === 0) {
			throw new Error('No claimable positions found');
		}

		const maxClaimablePosition = claimablePositions.reduce((max, current) => current.totalClaimableLamportsUserShare > max.totalClaimableLamportsUserShare ? current : max, claimablePositions[0]);

		// if max claimable position is less than 0.0001 SOL, throw an error
		if (maxClaimablePosition.totalClaimableLamportsUserShare < 0.0001 * LAMPORTS_PER_SOL) {
			throw new Error('Max claimable position is less than 0.0001 SOL');
		}

		const transactions = await fee.getClaimTransaction(testEnv.feeWallet, maxClaimablePosition);

		expect(Array.isArray(transactions)).toBe(true);
		expect(transactions.length).toBeGreaterThan(0);

		transactions.forEach((tx) => {
			expect(tx).toBeInstanceOf(Transaction);
		});
	});
});

