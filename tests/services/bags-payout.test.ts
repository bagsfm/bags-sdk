import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Connection, Keypair } from '@solana/web3.js';
import { BagsSDK } from '../../src';
import { BagsPayoutService } from '../../src/services/bags-payout';
import { FeeShareAdminService } from '../../src/services/fee-share-admin';
import { validateAndNormalizeCreateFeeShareConfigParams } from '../../src/utils/validations';

const sdk = new BagsSDK('test-key', new Connection('http://localhost:8899'));
const mint = Keypair.generate().publicKey.toBase58();

function mockClient(service: object) {
	const client = { get: vi.fn().mockResolvedValue('ok'), post: vi.fn().mockResolvedValue('ok') };
	(service as any).bagsApiClient = client;
	return client;
}

describe('BagsPayoutService (mocked transport)', () => {
	let service: BagsPayoutService;
	let client: ReturnType<typeof mockClient>;

	beforeEach(() => {
		service = sdk.bagsPayout;
		client = mockClient(service);
	});

	test('is registered on the client', () => {
		expect(service).toBeInstanceOf(BagsPayoutService);
	});

	test('getToken calls GET /bags-payout/token', async () => {
		await service.getToken(mint);
		expect(client.get).toHaveBeenCalledWith('/bags-payout/token', { params: { tokenMint: mint } });
	});

	test('getTokens posts the mints and enforces 1..100', async () => {
		await service.getTokens([mint]);
		expect(client.post).toHaveBeenCalledWith('/bags-payout/token/bulk', { tokenMints: [mint] });
		await expect(service.getTokens([])).rejects.toThrow('between 1 and 100');
		await expect(service.getTokens(Array(101).fill(mint))).rejects.toThrow('between 1 and 100');
	});

	test('setTokenCashout posts a trimmed cashout and rejects bad input', async () => {
		await service.setTokenCashout({ tokenMint: mint, cashout: { method: 'venmo', username: ' alice ' } });
		expect(client.post).toHaveBeenCalledWith('/bags-payout/token/cashout', { tokenMint: mint, cashout: { method: 'venmo', username: 'alice' } });
		await expect(service.setTokenCashout({ tokenMint: mint, cashout: { method: 'paypal' as any, username: 'a' } })).rejects.toThrow('cashout method');
		await expect(service.setTokenCashout({ tokenMint: mint, cashout: { method: 'venmo', username: 'a'.repeat(65) } })).rejects.toThrow('cashout username');
	});

	test('getHistory joins a status array with commas', async () => {
		await service.getHistory({ tokenMint: mint, limit: 5, status: ['paid', 'attention'] });
		expect(client.get).toHaveBeenCalledWith('/bags-payout/history', { params: { tokenMint: mint, limit: 5, cursor: undefined, status: 'paid,attention' } });
	});

	test('getPayout and getClaims call their routes', async () => {
		const id = 'a'.repeat(24);
		await service.getPayout(id);
		expect(client.get).toHaveBeenCalledWith('/bags-payout/payout', { params: { id } });
		await service.getClaims({ tokenMint: mint, cursor: id });
		expect(client.get).toHaveBeenCalledWith('/bags-payout/claims', { params: { tokenMint: mint, limit: undefined, cursor: id } });
	});
});

describe('payoutCashout on fee-share config requests', () => {
	const claimer = Keypair.generate().publicKey;
	const base = { feeClaimers: [{ user: claimer, userBps: 10000 }], payer: claimer, baseMint: Keypair.generate().publicKey };

	test('create config params include a validated payoutCashout', () => {
		expect(validateAndNormalizeCreateFeeShareConfigParams(base).payoutCashout).toBeUndefined();
		const normalized = validateAndNormalizeCreateFeeShareConfigParams({ ...base, payoutCashout: { method: 'cashapp', username: ' $bob ' } });
		expect(normalized.payoutCashout).toEqual({ method: 'cashapp', username: '$bob' });
		expect(() => validateAndNormalizeCreateFeeShareConfigParams({ ...base, payoutCashout: { method: 'venmo', username: '' } })).toThrow('cashout username');
	});

	test('admin update-config sends payoutCashout', async () => {
		const service = sdk.feeShareAdmin as FeeShareAdminService;
		const client = mockClient(service);
		client.post.mockResolvedValue({ transactions: [] });
		await service.getUpdateConfigTransactions({ ...base, payoutCashout: { method: 'xmoney', username: 'carol' } });
		expect(client.post.mock.calls[0][0]).toBe('/fee-share/admin/update-config');
		expect(client.post.mock.calls[0][1].payoutCashout).toEqual({ method: 'xmoney', username: 'carol' });
	});
});
