import { beforeAll, describe, expect, test } from 'vitest';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import { BAGS_FEE_SHARE_ADMIN_MAX_CLAIMERS_NON_LUT } from '../../src/constants';
import type { FeeShareAdminService } from '../../src/services/fee-share-admin';

let feeShareAdminService: FeeShareAdminService;
let adminTokenMints: string[];

beforeAll(async () => {
	feeShareAdminService = getTestSdk().feeShareAdmin;
	adminTokenMints = await feeShareAdminService.getAdminTokenMints(testEnv.feeShareAdminWallet);
});

describe('FeeShareAdminService integration', () => {
	test('getAdminTokenMints returns an array of token mint strings', () => {
		expect(Array.isArray(adminTokenMints)).toBe(true);
		expect(adminTokenMints.length).toBeGreaterThan(0);

		adminTokenMints.forEach((mint) => {
			expect(typeof mint).toBe('string');
			expect(mint.length).toBeGreaterThan(0);
		});
	});

	test('getTransferAdminTransaction returns a deserialized transaction and blockhash', async () => {
		const baseMint = adminTokenMints[0];

		const { transaction, blockhash } = await feeShareAdminService.getTransferAdminTransaction({
			baseMint: new PublicKey(baseMint),
			currentAdmin: testEnv.feeShareAdminWallet,
			newAdmin: Keypair.generate().publicKey,
			payer: testEnv.feeShareAdminWallet,
		});

		expect(transaction).toBeInstanceOf(VersionedTransaction);
		expect(typeof blockhash.blockhash).toBe('string');
		expect(blockhash.blockhash.length).toBeGreaterThan(0);
		expect(typeof blockhash.lastValidBlockHeight).toBe('number');
	});

	test('getUpdateConfigTransactions returns an ordered array of deserialized transactions', async () => {
		const transactionsWithBlockhash = await feeShareAdminService.getUpdateConfigTransactions({
			baseMint: testEnv.tokenMintFeeShareV2,
			feeClaimers: [
				{ user: Keypair.generate().publicKey, userBps: 5000 },
				{ user: Keypair.generate().publicKey, userBps: 5000 },
			],
			payer: testEnv.feeShareAdminWallet,
		});

		expect(Array.isArray(transactionsWithBlockhash)).toBe(true);
		expect(transactionsWithBlockhash.length).toBeGreaterThan(0);

		transactionsWithBlockhash.forEach(({ transaction, blockhash }) => {
			expect(transaction).toBeInstanceOf(VersionedTransaction);
			expect(typeof blockhash.blockhash).toBe('string');
			expect(blockhash.blockhash.length).toBeGreaterThan(0);
			expect(typeof blockhash.lastValidBlockHeight).toBe('number');
		});
	});

	test('getUpdateConfigLookupTableTransactions returns null when LUT not required', async () => {
		const result = await feeShareAdminService.getUpdateConfigLookupTableTransactions({
			feeClaimers: Array.from({ length: 2 }, () => ({
				user: Keypair.generate().publicKey,
				userBps: 5000,
			})),
			payer: Keypair.generate().publicKey,
		});

		expect(result).toBeNull();
	});

	test('getUpdateConfigLookupTableTransactions returns LUT transactions when claimers exceed threshold', async () => {
		const count = BAGS_FEE_SHARE_ADMIN_MAX_CLAIMERS_NON_LUT + 3;
		const feeClaimers = Array.from({ length: count }, () => ({
			user: Keypair.generate().publicKey,
			userBps: Math.floor(10_000 / count),
		}));

		const totalAssigned = feeClaimers.reduce((acc, c) => acc + c.userBps, 0);
		feeClaimers[feeClaimers.length - 1].userBps += 10_000 - totalAssigned;

		const result = await feeShareAdminService.getUpdateConfigLookupTableTransactions({
			feeClaimers,
			payer: Keypair.generate().publicKey,
		});

		expect(result).not.toBeNull();
		expect(result?.creationTransaction).toBeInstanceOf(VersionedTransaction);
		expect(result?.extendTransactions.length).toBeGreaterThan(0);
		result?.extendTransactions.forEach((tx) => expect(tx).toBeInstanceOf(VersionedTransaction));
		expect(result?.lutAddresses.length).toBeGreaterThan(0);
	});
});
