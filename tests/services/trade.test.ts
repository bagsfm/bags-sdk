import { beforeAll, describe, expect, test } from 'vitest';
import { VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';
import type { TradeQuoteResponse, TradeV2QuoteResponse } from '../../src/types/trade';

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

describe('TradeService v2 integration', () => {
	let quoteV2: TradeV2QuoteResponse;

	beforeAll(async () => {
		const sdk = getTestSdk();

		quoteV2 = await sdk.trade.getTradeV2Quote({
			inputMint: testEnv.tradeTokenMintFromTokenMint,
			outputMint: testEnv.tradeTokenMintToTokenMint,
			taker: testEnv.launchWallet,
			amount: '100000',
		});
	});

	test('getTradeV2Quote returns a valid quote response', () => {
		expect(quoteV2).toBeDefined();
		expect(typeof quoteV2.requestId).toBe('string');
		expect(quoteV2.requestId.length).toBeGreaterThan(0);
		expect(['jupiter', 'titan']).toContain(quoteV2.provider);
		expect(typeof quoteV2.inAmount).toBe('string');
		expect(typeof quoteV2.outAmount).toBe('string');
		expect(typeof quoteV2.feeMint).toBe('string');
		expect(['input', 'output']).toContain(quoteV2.feeSide);
		expect(typeof quoteV2.feeLamports).toBe('string');
	});

	test('createTradeV2Swap returns transaction metadata and decoded swap tx', async () => {
		const sdk = getTestSdk();
		const result = await sdk.trade.createTradeV2Swap({
			requestId: quoteV2.requestId,
			userPublicKey: testEnv.launchWallet,
		});

		expect(result.transaction).toBeInstanceOf(VersionedTransaction);
		expect(typeof result.computeUnitLimit).toBe('number');
		expect(typeof result.lastValidBlockHeight).toBe('number');
		expect(typeof result.prioritizationFeeLamports).toBe('number');
		expect(typeof result.feeMint).toBe('string');
		expect(['input', 'output']).toContain(result.feeSide);
		expect(typeof result.feeLamports).toBe('string');
		expect(typeof result.revenueLamports).toBe('string');
		expect(['jupiter', 'titan']).toContain(result.provider);
	});
});

