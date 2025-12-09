import { beforeAll, describe, expect, test } from 'vitest';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import type { DecodedPartnerConfig } from '../../src/types/fee-share-v2';
import type { PartnerService } from '../../src/services/partner';

let partnerConfig: DecodedPartnerConfig;
let partnerService: PartnerService;

beforeAll(async () => {
	partnerService = getTestSdk().partner;
	partnerConfig = await partnerService.getPartnerConfig(testEnv.partnerKey);
});

describe('PartnerService integration', () => {
	test('getPartnerConfig returns the partner config account for the provided wallet', () => {
		expect(partnerConfig).toBeDefined();
		expect(partnerConfig.partner.equals(testEnv.partnerKey)).toBe(true);
		expect(partnerConfig.bump).toBeGreaterThanOrEqual(0);
		expect(partnerConfig.bump).toBeLessThan(256);
		expect(partnerConfig.bps).toBeGreaterThanOrEqual(0);
		expect(partnerConfig.bps).toBeLessThanOrEqual(10_000);
	});

	test('getPartnerConfig exposes bigint fee counters', () => {
		expect(typeof partnerConfig.totalClaimedFees).toBe('bigint');
		expect(typeof partnerConfig.totalAccumulatedFees).toBe('bigint');
		expect(typeof partnerConfig.totalLifetimeAccumulatedFees).toBe('bigint');
		expect(partnerConfig.totalClaimedFees >= 0n).toBe(true);
		expect(partnerConfig.totalAccumulatedFees >= 0n).toBe(true);
		expect(partnerConfig.totalLifetimeAccumulatedFees >= partnerConfig.totalAccumulatedFees).toBe(true);
	});

	test('getPartnerConfigCreationTransaction returns a serialized transaction and blockhash metadata', async () => {
		const { transaction, blockhash } = await partnerService.getPartnerConfigCreationTransaction(testEnv.launchWallet);

		expect(transaction).toBeInstanceOf(VersionedTransaction);
		expect(typeof blockhash.blockhash).toBe('string');
		expect(blockhash.blockhash.length).toBeGreaterThan(0);
		expect(typeof blockhash.lastValidBlockHeight).toBe('number');
	});

	test('getPartnerConfigClaimStats returns numeric string counters', async () => {
		const stats = await partnerService.getPartnerConfigClaimStats(testEnv.partnerKey);

		expect(typeof stats.claimedFees).toBe('string');
		expect(typeof stats.unclaimedFees).toBe('string');
		expect(() => BigInt(stats.claimedFees)).not.toThrow();
		expect(() => BigInt(stats.unclaimedFees)).not.toThrow();

		const claimed = BigInt(stats.claimedFees);
		const unclaimed = BigInt(stats.unclaimedFees);

		expect(claimed >= 0n).toBe(true);
		expect(unclaimed >= -1n).toBe(true);
	});

	test('getPartnerConfigClaimTransactions returns claim transactions when available', async () => {
		const transactionsWithBlockhash = await partnerService.getPartnerConfigClaimTransactions(testEnv.partnerKey);

		expect(Array.isArray(transactionsWithBlockhash)).toBe(true);

		transactionsWithBlockhash.forEach(({ transaction, blockhash }) => {
			expect(transaction).toBeInstanceOf(VersionedTransaction);
			expect(typeof blockhash.blockhash).toBe('string');
			expect(blockhash.blockhash.length).toBeGreaterThan(0);
			expect(typeof blockhash.lastValidBlockHeight).toBe('number');
		});
	});
});
