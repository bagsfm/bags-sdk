import { Commitment, Connection, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { BaseService } from './base';
import { CreateSwapTransactionParams, CreateSwapTransactionResult, GetTradeQuoteParams, TradeQuoteResponse, TradeSwapTransactionResponse } from '../types';
import { validateAndNormalizeGetTradeQuoteParams } from '../utils/validations';

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
}
