import { beforeAll, describe, expect, test } from 'vitest';
import { LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import { ApiError } from '../../src/api/bags-client';
import type { CreateTokenInfoResponse } from '../../src/types/token-launch';

let tokenInfoResponse: CreateTokenInfoResponse;

beforeAll(async () => {
	const sdk = getTestSdk();

	tokenInfoResponse = await sdk.tokenLaunch.createTokenInfoAndMetadata({
		image: Buffer.from(testEnv.tokenLaunchImageBase64, 'base64'),
		name: testEnv.tokenLaunchName,
		symbol: testEnv.tokenLaunchSymbol,
		description: testEnv.tokenLaunchDescription,
		website: testEnv.tokenLaunchWebsite,
		telegram: testEnv.tokenLaunchTelegram,
		twitter: testEnv.tokenLaunchTwitter,
	});
});

describe('TokenLaunchService integration', () => {
	test('createTokenInfoAndMetadata returns token launch metadata', () => {
		expect(tokenInfoResponse).toBeDefined();
		expect(() => new PublicKey(tokenInfoResponse.tokenMint)).not.toThrow();
		expect(tokenInfoResponse.tokenLaunch).toBeDefined();
		expect(tokenInfoResponse.tokenLaunch.name).toContain(testEnv.tokenLaunchName);
	});

	test('createLaunchTransaction returns a versioned transaction', async () => {
		const sdk = getTestSdk();
		const transaction = await sdk.tokenLaunch.createLaunchTransaction({
			metadataUrl: tokenInfoResponse.tokenMetadata,
			tokenMint: new PublicKey(tokenInfoResponse.tokenMint),
			launchWallet: testEnv.launchWallet,
			initialBuyLamports: 0.001 * LAMPORTS_PER_SOL,
			configKey: testEnv.configKey
		});

		expect(transaction).toBeInstanceOf(VersionedTransaction);
	});

	test('getDammV2Launches returns a paginated page of launches', async () => {
		const sdk = getTestSdk();
		const page = await sdk.tokenLaunch.getDammV2Launches({ limit: 5 });

		expect(Array.isArray(page.launches)).toBe(true);
		expect(page.launches.length).toBeLessThanOrEqual(5);
		expect(typeof page.hasMore).toBe('boolean');

		if (page.launches.length > 0) {
			const [first] = page.launches;
			expect(() => new PublicKey(first.tokenMint)).not.toThrow();
		}
	});

	test('claimDammV2Vault returns a claim transaction, or throws "Nothing to claim" for an empty vault', async () => {
		const sdk = getTestSdk();

		try {
			const result = await sdk.tokenLaunch.claimDammV2Vault({
				kind: 'partner',
				wallet: testEnv.launchWallet,
				quoteMint: testEnv.quoteMint,
			});

			expect(result.transaction).toBeInstanceOf(VersionedTransaction);
			expect(result.claimable.wallet).toBe(testEnv.launchWallet.toBase58());
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
			expect((error as ApiError).status).toBe(400);
		}
	});
});

