import { describe, expect, test } from 'vitest';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import type { DexscreenerService } from '../../src/services/dexscreener';

let dexscreenerService: DexscreenerService;

describe('DexscreenerService integration', () => {
	test('checkOrderAvailability returns availability status for a known token', async () => {
		dexscreenerService = getTestSdk().dexscreener;
		const result = await dexscreenerService.checkOrderAvailability({
			tokenAddress: testEnv.tokenMint,
		});

		expect(result).toBeDefined();
		expect(typeof result.available).toBe('boolean');
	});

	test('createOrder rejects an empty description', async () => {
		dexscreenerService = getTestSdk().dexscreener;
		await expect(
			dexscreenerService.createOrder({
				tokenAddress: testEnv.tokenMint,
				description: '',
				iconImageUrl: 'https://example.com/icon.png',
				headerImageUrl: 'https://example.com/header.png',
				payerWallet: testEnv.launchWallet,
			})
		).rejects.toThrow('Description must be at least 1 character');
	});

	test('createOrder rejects an invalid iconImageUrl', async () => {
		dexscreenerService = getTestSdk().dexscreener;
		await expect(
			dexscreenerService.createOrder({
				tokenAddress: testEnv.tokenMint,
				description: 'A valid description',
				iconImageUrl: 'not-a-url',
				headerImageUrl: 'https://example.com/header.png',
				payerWallet: testEnv.launchWallet,
			})
		).rejects.toThrow('iconImageUrl must be a valid URL');
	});

	test('createOrder rejects an invalid headerImageUrl', async () => {
		dexscreenerService = getTestSdk().dexscreener;
		await expect(
			dexscreenerService.createOrder({
				tokenAddress: testEnv.tokenMint,
				description: 'A valid description',
				iconImageUrl: 'https://example.com/icon.png',
				headerImageUrl: 'not-a-url',
				payerWallet: testEnv.launchWallet,
			})
		).rejects.toThrow('headerImageUrl must be a valid URL');
	});

	test('createOrder rejects an invalid link url', async () => {
		dexscreenerService = getTestSdk().dexscreener;
		await expect(
			dexscreenerService.createOrder({
				tokenAddress: testEnv.tokenMint,
				description: 'A valid description',
				iconImageUrl: 'https://example.com/icon.png',
				headerImageUrl: 'https://example.com/header.png',
				payerWallet: testEnv.launchWallet,
				links: [{ url: 'bad-url' }],
			})
		).rejects.toThrow('Each link url must be a valid URL');
	});

	test('submitPayment rejects an empty orderUUID', async () => {
		dexscreenerService = getTestSdk().dexscreener;
		await expect(
			dexscreenerService.submitPayment({
				orderUUID: '',
				paymentSignature: 'some-signature',
			})
		).rejects.toThrow('orderUUID is required and must be a non-empty string');
	});

	test('submitPayment rejects an empty paymentSignature', async () => {
		dexscreenerService = getTestSdk().dexscreener;

		await expect(
			dexscreenerService.submitPayment({
				orderUUID: 'some-uuid',
				paymentSignature: '',
			})
		).rejects.toThrow('paymentSignature is required and must be a non-empty string');
	});
});
