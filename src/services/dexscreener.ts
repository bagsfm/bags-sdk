import { Commitment, Connection } from '@solana/web3.js';
import { BaseService } from './base';
import type {
	CheckDexscreenerOrderAvailabilityParams,
	CheckDexscreenerOrderAvailabilityResponse,
	CreateDexscreenerOrderParams,
	CreateDexscreenerOrderResponse,
	SubmitDexscreenerPaymentParams,
} from '../types';
import { validateAndNormalizeCreateDexscreenerOrderParams } from '../utils/validations';

export class DexscreenerService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Check whether a Dexscreener token info order can be placed for a given token.
	 * @param params - Parameters containing the token address to check.
	 * @returns Whether an order is available for the specified token.
	 */
	async checkOrderAvailability(params: CheckDexscreenerOrderAvailabilityParams): Promise<CheckDexscreenerOrderAvailabilityResponse> {
		return this.bagsApiClient.get<CheckDexscreenerOrderAvailabilityResponse>('/solana/dexscreener/order-availability', {
			params: { tokenAddress: params.tokenAddress.toBase58() },
		});
	}

	/**
	 * Create a Dexscreener token info order. Returns payment details and a pre-built
	 * transaction that must be signed and submitted via `submitPayment`.
	 * @param params - Order details including token address, description, images, and payer wallet.
	 * @returns The created order with a serialized payment transaction.
	 */
	async createOrder(params: CreateDexscreenerOrderParams): Promise<CreateDexscreenerOrderResponse> {
		const normalizedParams = validateAndNormalizeCreateDexscreenerOrderParams(params);

		return this.bagsApiClient.post<CreateDexscreenerOrderResponse>('/solana/dexscreener/create-order', normalizedParams);
	}

	/**
	 * Submit the signed payment transaction for a previously created Dexscreener order.
	 * @param params - The order UUID and the transaction signature of the submitted payment.
	 * @returns A payment confirmation message.
	 */
	async submitPayment(params: SubmitDexscreenerPaymentParams): Promise<string> {
		if (!params.orderUUID) {
			throw new Error('orderUUID is required and must be a non-empty string');
		}

		if (!params.paymentSignature) {
			throw new Error('paymentSignature is required and must be a non-empty string');
		}

		return this.bagsApiClient.post<string>('/solana/dexscreener/submit-payment', params);
	}
}
