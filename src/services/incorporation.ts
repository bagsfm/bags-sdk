import { Commitment, Connection, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { BaseService } from './base';
import type {
	IncorporateParams,
	IncorporateResponse,
	IncorporationDetailsResponse,
	IncorporationProjectResponse,
	GetIncorporationDetailsParams,
	StartIncorporationParams,
	StartIncorporationResponse,
	StartPaymentApiResponse,
	StartPaymentParams,
	StartPaymentResult,
	IncorporationFounderPepResponse,
} from '../types';
import { validateAndNormalizeIncorporateParams, validateAndNormalizeStartPaymentParams } from '../utils/validations';

interface IncorporateApiFounderResponse {
	founderId: string;
	firstName: string;
	lastName: string;
	kycUrl: string;
	kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
	shareBasisPoint: number;
	bedrockFormUrl: string | null;
	pep: IncorporationFounderPepResponse;
	ipAttributionAcknowledgedAt: string | null;
}

interface IncorporateApiResponse {
	tokenAddress: string;
	incorporationStatus: string;
	founders: IncorporateApiFounderResponse[];
	bedrockShareBasisPoint: number;
	category: string | null;
	twitterHandle: string | null;
	preferredCompanyNames: string[];
}

interface IncorporationProjectApiResponse {
	tokenAddress: string;
	incorporationStatus: string;
	founders: Array<{
		id: string;
		firstName: string;
		lastName: string;
		kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
		pepCompleted: boolean;
		ipAttributionAcknowledged: boolean;
		shareBasisPoint: number;
	}>;
	bedrockShareBasisPoint: number;
	category: string | null;
	twitterHandle: string | null;
	createdAt: string;
	preferredCompanyNames: string[];
	isReadyForIncorporation: boolean;
}

interface IncorporationDetailsApiResponse {
	tokenAddress: string;
	incorporationStatus: string;
	bedrockShareBasisPoint: number;
	category: string | null;
	twitterHandle: string | null;
	createdAt: string;
	preferredCompanyNames: string[];
	isReadyForIncorporation: boolean;
}

export class IncorporationService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Start a payment for token incorporation. Returns a pre-built transaction
	 * that must be signed and submitted.
	 *
	 * @param params Payment parameters including the payer wallet.
	 * @returns Payment details with a deserialized transaction ready for signing.
	 */
	async startPayment(params: StartPaymentParams): Promise<StartPaymentResult> {
		const normalized = validateAndNormalizeStartPaymentParams(params);

		const response = await this.bagsApiClient.post<StartPaymentApiResponse>('/incorporate/start-payment', normalized);

		const decodedTransaction = bs58.decode(response.transaction);
		const transaction = VersionedTransaction.deserialize(decodedTransaction);

		return {
			orderUUID: response.orderUUID,
			recipientWallet: response.recipientWallet,
			priceUSDC: response.priceUSDC,
			transaction,
			lastValidBlockHeight: response.lastValidBlockHeight,
		};
	}

	/**
	 * Submit incorporation details after payment. Registers the project with
	 * founders, company name preferences, and category.
	 *
	 * @param params Incorporation details including founders, company names, and share allocations.
	 * @returns The created incorporation record with founder KYC details.
	 */
	async incorporate(params: IncorporateParams): Promise<IncorporateResponse> {
		const normalized = validateAndNormalizeIncorporateParams(params);

		const { incorporationShareBasisPoint, ...rest } = normalized;
		const response = await this.bagsApiClient.post<IncorporateApiResponse>('/incorporate/incorporate', {
			...rest,
			bedrockShareBasisPoint: incorporationShareBasisPoint,
		});

		return {
			tokenAddress: response.tokenAddress,
			incorporationStatus: response.incorporationStatus,
			founders: response.founders.map((f) => ({
				founderId: f.founderId,
				firstName: f.firstName,
				lastName: f.lastName,
				kycUrl: f.kycUrl,
				kycStatus: f.kycStatus,
				shareBasisPoint: f.shareBasisPoint,
				formUrl: f.bedrockFormUrl,
				pep: f.pep,
				ipAttributionAcknowledgedAt: f.ipAttributionAcknowledgedAt,
			})),
			incorporationShareBasisPoint: response.bedrockShareBasisPoint,
			category: response.category,
			twitterHandle: response.twitterHandle,
			preferredCompanyNames: response.preferredCompanyNames,
		};
	}

	/**
	 * Start the incorporation process for a token once all prerequisites are met.
	 *
	 * @param params Parameters containing the token address.
	 * @returns Confirmation that the incorporation process has started.
	 */
	async startIncorporation(params: StartIncorporationParams): Promise<StartIncorporationResponse> {
		return this.bagsApiClient.post<StartIncorporationResponse>(`/incorporate/start-incorporation/${params.tokenAddress.toBase58()}`, {});
	}

	/**
	 * List all incorporation projects associated with the authenticated API key.
	 *
	 * @returns An array of incorporation projects with their current status and founder details.
	 */
	async list(): Promise<IncorporationProjectResponse[]> {
		const response = await this.bagsApiClient.get<IncorporationProjectApiResponse[]>('/incorporate/list');

		return response.map((project) => ({
			tokenAddress: project.tokenAddress,
			incorporationStatus: project.incorporationStatus,
			founders: project.founders,
			incorporationShareBasisPoint: project.bedrockShareBasisPoint,
			category: project.category,
			twitterHandle: project.twitterHandle,
			createdAt: project.createdAt,
			preferredCompanyNames: project.preferredCompanyNames,
			isReadyForIncorporation: project.isReadyForIncorporation,
		}));
	}

	/**
	 * Get detailed information about a specific incorporation project.
	 *
	 * @param params Parameters containing the token address to look up.
	 * @returns The incorporation project details.
	 */
	async getDetails(params: GetIncorporationDetailsParams): Promise<IncorporationDetailsResponse> {
		const response = await this.bagsApiClient.get<IncorporationDetailsApiResponse>(`/incorporate/details/${params.tokenAddress.toBase58()}`);

		return {
			tokenAddress: response.tokenAddress,
			incorporationStatus: response.incorporationStatus,
			incorporationShareBasisPoint: response.bedrockShareBasisPoint,
			category: response.category,
			twitterHandle: response.twitterHandle,
			createdAt: response.createdAt,
			preferredCompanyNames: response.preferredCompanyNames,
			isReadyForIncorporation: response.isReadyForIncorporation,
		};
	}
}
