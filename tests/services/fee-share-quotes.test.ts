import { describe, expect, test } from 'vitest';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import { ApiError } from '../../src/api/bags-client';

function expectDecodedPlan(plan: { transactions: unknown[] }) {
	expect(Array.isArray(plan.transactions)).toBe(true);
	plan.transactions.forEach((stage) => {
		expect((stage as { transaction: unknown }).transaction).toBeInstanceOf(VersionedTransaction);
	});
}

describe('Native quote fee share endpoints integration', () => {
	test('getSupportedQuoteTokens returns a capabilities response', async () => {
		const sdk = getTestSdk();
		const result = await sdk.tokenLaunch.getSupportedQuoteTokens();

		expect(result.contractVersion).toBe(1);
		expect(Array.isArray(result.tokens)).toBe(true);
	});

	test('getSupportedQuoteTokens filters by flow', async () => {
		const sdk = getTestSdk();
		const result = await sdk.tokenLaunch.getSupportedQuoteTokens('dbc');

		expect(Array.isArray(result.tokens)).toBe(true);
		result.tokens.forEach((token) => {
			token.flows.forEach((flow) => expect(flow.flow).toBe('dbc'));
		});
	});

	test('getQuoteClaimablePositions returns a claimables response for a wallet', async () => {
		const sdk = getTestSdk();
		const result = await sdk.tokenLaunch.getQuoteClaimablePositions(testEnv.feeWallet);

		expect(result.contractVersion).toBe(1);
		expect(result.wallet).toBe(testEnv.feeWallet.toBase58());
		expect(Array.isArray(result.items)).toBe(true);
		expect(Array.isArray(result.issues)).toBe(true);
		expect(typeof result.complete).toBe('boolean');
	});

	test('getQuoteClaimablePosition scopes the claimables response to a single mint', async () => {
		const sdk = getTestSdk();
		const result = await sdk.tokenLaunch.getQuoteClaimablePosition(testEnv.feeWallet, testEnv.tokenMintFeeShareV2);

		expect(result.contractVersion).toBe(1);
		expect(result.wallet).toBe(testEnv.feeWallet.toBase58());
		expect(Array.isArray(result.items)).toBe(true);
	});

	test('createQuoteFeeShareConfig returns a plan or a known quote error', async () => {
		const sdk = getTestSdk();
		const claimerA = Keypair.generate().publicKey;
		const claimerB = Keypair.generate().publicKey;

		try {
			const result = await sdk.config.createQuoteFeeShareConfig({
				baseMint: testEnv.notUsedBagsTokenMint,
				payer: testEnv.feeWallet,
				flow: 'dbc',
				claimersArray: [claimerA, claimerB],
				basisPointsArray: [5000, 5000],
				quoteMint: testEnv.quoteMint,
			});

			expect(result.feeShareConfig).toBeInstanceOf(PublicKey);
			expect(result.asset.mint).toBe(testEnv.quoteMint.toBase58());
			if (result.plan) {
				expectDecodedPlan(result.plan);
			}
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
			expect((error as ApiError).status).toBeGreaterThanOrEqual(400);
		}
	});

	test('createQuoteFeeShareConfig rejects mismatched recipient arrays', async () => {
		const sdk = getTestSdk();

		await expect(
			sdk.config.createQuoteFeeShareConfig({
				baseMint: testEnv.notUsedBagsTokenMint,
				payer: testEnv.feeWallet,
				flow: 'dbc',
				claimersArray: [Keypair.generate().publicKey],
				basisPointsArray: [5000, 5000],
				quoteMint: testEnv.quoteMint,
			})
		).rejects.toBeInstanceOf(ApiError);
	});

	test('updateQuoteFeeShareConfig returns a plan or a known quote error', async () => {
		const sdk = getTestSdk();

		try {
			const plan = await sdk.feeShareAdmin.updateQuoteFeeShareConfig({
				baseMint: testEnv.tokenMintFeeShareV2,
				payer: testEnv.feeShareAdminWallet,
				claimersArray: [Keypair.generate().publicKey, Keypair.generate().publicKey],
				basisPointsArray: [5000, 5000],
			});

			expect(plan.operation.kind).toBe('manager_update');
			expectDecodedPlan(plan);
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
			expect((error as ApiError).status).toBeGreaterThanOrEqual(400);
		}
	});

	test('createQuoteDbcLaunchTransaction returns a plan or a known quote error', async () => {
		const sdk = getTestSdk();

		try {
			const plan = await sdk.tokenLaunch.createQuoteDbcLaunchTransaction({
				tokenMint: testEnv.notUsedBagsTokenMint,
				wallet: testEnv.launchWallet,
				feeShareConfig: testEnv.notUsedBagsTokenMint,
				quoteMint: testEnv.quoteMint,
				metadataUrl: `https://example.com/${testEnv.notUsedBagsTokenMint.toBase58()}.json`,
				configKey: testEnv.configKey,
			});

			expect(plan.operation.kind).toBe('launch');
			expectDecodedPlan(plan);
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
			expect((error as ApiError).status).toBeGreaterThanOrEqual(400);
		}
	});

	test('createQuoteDammV2LaunchTransaction returns a plan or a known quote error', async () => {
		const sdk = getTestSdk();

		try {
			const plan = await sdk.tokenLaunch.createQuoteDammV2LaunchTransaction({
				tokenMint: testEnv.notUsedBagsTokenMint,
				wallet: testEnv.launchWallet,
				feeShareConfig: testEnv.notUsedBagsTokenMint,
				quoteMint: testEnv.quoteMint,
				metadataUrl: `https://example.com/${testEnv.notUsedBagsTokenMint.toBase58()}.json`,
			});

			expect(plan.operation.kind).toBe('launch');
			expectDecodedPlan(plan);
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
			expect((error as ApiError).status).toBeGreaterThanOrEqual(400);
		}
	});

	test('createQuoteClaimTransaction returns a plan, or "nothing to claim" for an empty position', async () => {
		const sdk = getTestSdk();

		try {
			const plan = await sdk.tokenLaunch.createQuoteClaimTransaction({
				feeClaimer: testEnv.feeWallet,
				tokenMint: testEnv.tokenMintFeeShareV2,
			});

			expect(['position_claim', 'holding_claim']).toContain(plan.operation.kind);
			expectDecodedPlan(plan);
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
			expect((error as ApiError).status).toBeGreaterThanOrEqual(400);
		}
	});
});
