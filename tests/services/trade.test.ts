import { beforeAll, describe, expect, test } from 'vitest';
import { VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import type { TradeQuoteResponse } from '../../src/types/trade';

let quote: TradeQuoteResponse;

beforeAll(async () => {
	const sdk = getTestSdk();

	quote = await sdk.trade.getQuote({
		inputMint: testEnv.tradeTokenMintFromTokenMint,
		outputMint: testEnv.tradeTokenMintToTokenMint,
		amount: 100_000,
		slippageMode: 'auto',
	});
});

describe('TradeService integration', () => {
	test('getQuote returns a valid quote response', () => {
		expect(quote).toBeDefined();
		expect(typeof quote.requestId).toBe('string');
		expect(quote.requestId.length).toBeGreaterThan(0);
		expect(Array.isArray(quote.routePlan)).toBe(true);
		expect(typeof quote.inAmount).toBe('string');
		expect(typeof quote.outAmount).toBe('string');
	});

	test('createSwapTransaction returns transaction metadata and decoded swap tx', async () => {
		const sdk = getTestSdk();
		const result = await sdk.trade.createSwapTransaction({
			quoteResponse: quote,
			userPublicKey: testEnv.launchWallet,
		});

		expect(result.transaction).toBeInstanceOf(VersionedTransaction);
		expect(typeof result.computeUnitLimit).toBe('number');
		expect(typeof result.lastValidBlockHeight).toBe('number');
		expect(typeof result.prioritizationFeeLamports).toBe('number');
	});
});

