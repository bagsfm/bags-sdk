import { Commitment, Connection, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import type { BundleStatusesResponse, JitoRegion, JitoTipResponse, SendBundleRequestPayload } from '../types/solana';
import { JITO_REGIONS } from '../types/solana';
import { serializeVersionedTransaction } from '../utils/helpers';

export class SolanaService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Submit a bundle of versioned transactions to the Jito relayer network.
	 * @param transactions - Collection of `VersionedTransaction` instances or base64-encoded transaction strings.
	 * @param region - Target Jito region for bundle dissemination. Defaults to `mainnet`.
	 * @returns The bundle identifier string assigned by the Bags API.
	 * @throws Error when no transactions are provided or the region is unsupported.
	 */
	async sendBundle(transactions: Array<VersionedTransaction | string>, region: JitoRegion = 'mainnet'): Promise<string> {
		if (!transactions.length) {
			throw new Error('At least one transaction is required to send a bundle');
		}

		if (!JITO_REGIONS.includes(region)) {
			throw new Error(`Unsupported region "${region}". Expected one of: ${JITO_REGIONS.join(', ')}`);
		}

		const payload: SendBundleRequestPayload = {
			transactions: transactions.map(serializeVersionedTransaction),
			region,
		};

		return this.bagsApiClient.post<string>('/solana/send-bundle', payload);
	}

	/**
	 * Retrieve the latest status metadata for one or more previously submitted bundles.
	 * @param bundleIds - Array of bundle identifiers returned from `sendBundle`.
	 * @param region - Region that the bundles were submitted to. Defaults to `mainnet`.
	 * @returns The bundle status payload returned by the Bags API or `null` when unavailable.
	 * @throws Error when no bundle IDs are provided or the region is unsupported.
	 */
	async getBundleStatuses(bundleIds: Array<string>, region: JitoRegion = 'mainnet'): Promise<BundleStatusesResponse | null> {
		if (!bundleIds.length) {
			throw new Error('At least one bundle ID is required to fetch bundle statuses');
		}

		if (!JITO_REGIONS.includes(region)) {
			throw new Error(`Unsupported region "${region}". Expected one of: ${JITO_REGIONS.join(', ')}`);
		}

		return this.bagsApiClient.post<BundleStatusesResponse | null>('/solana/get-bundle-statuses', {
			bundleIds,
			region,
		});
	}

	/**
	 * Fetch the most recent Jito fee percentile metrics.
	 * @returns A single snapshot of Jito landed tip percentiles and EMA values.
	 */
	async getJitoRecentFees(): Promise<JitoTipResponse> {
		return this.bagsApiClient.get<JitoTipResponse>('/solana/jito-recent-fees');
	}
}
