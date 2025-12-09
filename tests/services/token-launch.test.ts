import { beforeAll, describe, expect, test } from 'vitest';
import { LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
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
});

