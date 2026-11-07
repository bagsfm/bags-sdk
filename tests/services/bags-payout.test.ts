import { afterEach, describe, expect, test, vi } from 'vitest';
import { Connection } from '@solana/web3.js';
import { BagsPayoutService } from '../../src/services/bags-payout';
import { BagsApiClient } from '../../src/api/bags-client';
import type { BagsPayoutPayment } from '../../src/types';

const service = () => new BagsPayoutService('test-key', new Connection('http://localhost:8899'));
const ID = `0x${'ab'.repeat(32)}`;

describe('BagsPayoutService getPayment', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('requests the payment by id and returns the unwrapped view', async () => {
		const payment: BagsPayoutPayment = {
			id: ID,
			payoutId: '6aebbb029893988c540a0cb4',
			tokenMint: 'AVVtstcEFxbnGA5Nk2Lx5d6Cc2PztcTeRJVik9uLBAGS',
			tokenName: 'Boar',
			tokenSymbol: 'BOAR',
			tokenImage: null,
			cashoutMethod: 'xmoney',
			username: '@FinnBags',
			displayHandle: '@FinnBags',
			fiatPaidCents: '4118',
			amountRaw: '45746116',
			discountBps: 1000,
			paidAt: '2026-11-05T01:28:00.000Z',
		};
		const get = vi.spyOn(BagsApiClient.prototype, 'get').mockResolvedValue(payment);

		await expect(service().getPayment(ID)).resolves.toEqual(payment);
		expect(get).toHaveBeenCalledWith('/bags-payout/payment', { params: { id: ID } });
	});

	test('returns null when the payment does not exist', async () => {
		vi.spyOn(BagsApiClient.prototype, 'get').mockResolvedValue(null);

		await expect(service().getPayment(ID)).resolves.toBeNull();
	});
});
