import { describe, expect, test } from 'vitest';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import type { PublicKey } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT, WRAPPED_SOL_MINT } from '../../src/constants';
import { testEnv } from '../helpers/env';

function buildFeeClaimer(): { user: PublicKey; userBps: number } {
	return {
		user: Keypair.generate().publicKey,
		userBps: 10_000 / 2,
	};
}

describe('ConfigService', () => {
	test('getConfigCreationLookupTableTransactions returns null when LUT not required', async () => {
		const { config } = getTestSdk();
		const payer = Keypair.generate().publicKey;

		const result = await config.getConfigCreationLookupTableTransactions({
			payer,
			baseMint: testEnv.tokenMint,
			feeClaimers: Array.from({ length: 2 }, () => buildFeeClaimer()),
		});

		expect(result).toBeNull();
	});

	test('getConfigCreationLookupTableTransactions returns creation and extend transactions when LUT is required', async () => {
		const { config } = getTestSdk();
		const payer = Keypair.generate().publicKey;

		const feeClaimers = Array.from({ length: BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT + 5 }, (_, idx) => ({
			user: Keypair.generate().publicKey,
			userBps: Math.floor(10_000 / (BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT + 5)),
		}));

		// Adjust final claimer BPS so sum == 10_000
		const totalAssigned = feeClaimers.reduce((acc, claimer) => acc + claimer.userBps, 0);
		const diff = 10_000 - totalAssigned;
		feeClaimers[feeClaimers.length - 1].userBps += diff;

		const lutResult = await config.getConfigCreationLookupTableTransactions(
			{
				payer,
				baseMint: testEnv.tokenMint,
				feeClaimers,
			},
			{
				tipWallet: Keypair.generate().publicKey,
				tipLamports: 1_000,
			}
		);

		expect(lutResult).not.toBeNull();
		expect(lutResult?.creationTransaction).toBeInstanceOf(VersionedTransaction);
		expect(lutResult?.extendTransactions.length).toBeGreaterThan(0);

		lutResult?.extendTransactions.forEach((tx) => expect(tx).toBeInstanceOf(VersionedTransaction));
	});

	test('createBagsFeeShareConfig enforces validation rules', async () => {
		const { config } = getTestSdk();
		const payer = testEnv.feeWallet;

		const claimerA = Keypair.generate().publicKey;
		const claimerB = Keypair.generate().publicKey;

		await expect(
			config.createBagsFeeShareConfig({
				payer,
				baseMint: testEnv.tokenMint,
				feeClaimers: [
					{ user: claimerA, userBps: 7000 },
					{ user: claimerB, userBps: 2000 },
				],
			})
		).rejects.toThrow('Total BPS must be 10000');

		await expect(
			config.createBagsFeeShareConfig({
				payer,
				baseMint: testEnv.tokenMint,
				feeClaimers: Array.from({ length: 200 }, () => ({
					user: Keypair.generate().publicKey,
					userBps: 50,
				})),
			})
		).rejects.toThrow('Total fee claimers must be less than 100');

		await expect(
			config.createBagsFeeShareConfig({
				payer,
				baseMint: testEnv.tokenMint,
				feeClaimers: Array.from({ length: BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT + 1 }, () => ({
					user: Keypair.generate().publicKey,
					userBps: Math.floor(10_000 / (BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT + 1)),
				})),
			})
		).rejects.toThrow('Total fee claimers exceeds BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT; please provide an additional lookup tables.');

		const result = await config.createBagsFeeShareConfig({
			payer,
			baseMint: testEnv.tokenMint,
			feeClaimers: [
				{ user: claimerA, userBps: 5000 },
				{ user: claimerB, userBps: 5000 },
			],
			additionalLookupTables: [],
		});

		expect(result).toBeDefined();
		expect(result).toHaveProperty('transactions');
		expect(result).toHaveProperty('bundles');

		const { transactions, bundles } = result;

		expect(Array.isArray(transactions)).toBe(true);
		expect(Array.isArray(bundles)).toBe(true);
		expect(transactions.length > 0 || bundles.length > 0).toBe(true);

		transactions.forEach((transaction) => {
			expect(transaction).toBeInstanceOf(VersionedTransaction);
		});

		bundles.forEach((bundle) => {
			expect(Array.isArray(bundle)).toBe(true);
			expect(bundle.length).toBeGreaterThan(0);

			bundle.forEach((transaction) => {
				expect(transaction).toBeInstanceOf(VersionedTransaction);
			});
		});
	});
});

