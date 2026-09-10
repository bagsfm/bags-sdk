import { Commitment, Connection, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { BaseService } from './base';
import {
	CreateSwapTransactionParams,
	CreateSwapTransactionResult,
	CreateTradeV2SwapParams,
	CreateTradeV2SwapResult,
	GetTradeQuoteParams,
	GetTradeV2QuoteParams,
	TradeQuoteResponse,
	TradeSwapTransactionResponse,
	TradeV2QuoteResponse,
	TradeV2SwapTransactionResponse,
} from '../types';
import { validateAndNormalizeGetTradeQuoteParams, validateAndNormalizeGetTradeV2QuoteParams } from '../utils/validations';

export class TradeService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Fetch a swap quote for a given token pair.
	 *
	 * @param params Quote parameters including input/output mints, amount, and slippage preferences.
	 * @returns A trade quote response containing the swap route and pricing details.
	 */
	async getQuote(params: GetTradeQuoteParams): Promise<TradeQuoteResponse> {
		const normalizedParams = validateAndNormalizeGetTradeQuoteParams(params);

		const response = await this.bagsApiClient.get<TradeQuoteResponse>('/trade/quote', {
			params: normalizedParams,
		});

		return response;
	}

	/**
	 * Create a swap transaction from a previously retrieved quote.
	 *
	 * @param params Swap parameters including the quote response and the user public key that will execute the swap.
	 * @returns A versioned transaction ready to be signed and submitted.
	 */
	async createSwapTransaction(params: CreateSwapTransactionParams): Promise<CreateSwapTransactionResult> {
		const response = await this.bagsApiClient.post<TradeSwapTransactionResponse>('/trade/swap', params);

		if (!response.swapTransaction) {
			throw new Error('Invalid swap transaction response from Bags API');
		}

		const decodedTransaction = bs58.decode(response.swapTransaction);
		const transaction = VersionedTransaction.deserialize(decodedTransaction);

		return {
			transaction,
			computeUnitLimit: response.computeUnitLimit,
			lastValidBlockHeight: response.lastValidBlockHeight,
			prioritizationFeeLamports: response.prioritizationFeeLamports,
		};
	}

	/**
	 * Fetch a server-built swap quote, racing Jupiter and Titan (when configured).
	 * The winning quote is cached server-side for 60 seconds under the returned `requestId`.
	 *
	 * @param params Quote parameters including input/output mints, taker, amount, and provider preferences.
	 * @returns A trade v2 quote response containing the `requestId` used to build the swap.
	 */
	async getTradeV2Quote(params: GetTradeV2QuoteParams): Promise<TradeV2QuoteResponse> {
		const normalizedParams = validateAndNormalizeGetTradeV2QuoteParams(params);

		const response = await this.bagsApiClient.get<TradeV2QuoteResponse>('/trade/v2/quote', {
			params: normalizedParams,
		});

		return response;
	}

	/**
	 * Build the unsigned swap transaction for a previously fetched trade v2 quote.
	 *
	 * @param params Swap parameters including the quote's `requestId` and the taker's public key.
	 * @returns A versioned transaction ready to be signed and submitted, plus fee and provider metadata.
	 */
	async createTradeV2Swap(params: CreateTradeV2SwapParams): Promise<CreateTradeV2SwapResult> {
		const response = await this.bagsApiClient.post<TradeV2SwapTransactionResponse>('/trade/v2/swap', params);

		if (!response.swapTransaction) {
			throw new Error('Invalid trade v2 swap transaction response from Bags API');
		}

		const decodedTransaction = bs58.decode(response.swapTransaction);
		const transaction = VersionedTransaction.deserialize(decodedTransaction);

		return {
			transaction,
			computeUnitLimit: response.computeUnitLimit,
			prioritizationFeeLamports: response.prioritizationFeeLamports,
			lastValidBlockHeight: response.lastValidBlockHeight,
			feeLamports: response.feeLamports,
			revenueLamports: response.revenueLamports,
			provider: response.provider,
		};
	}
}
