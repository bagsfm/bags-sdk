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
});

