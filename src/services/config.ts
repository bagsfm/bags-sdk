import { AddressLookupTableProgram, Commitment, ComputeBudgetProgram, Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import type { BagsGetOrCreateFeeShareConfigArgs, TransactionTipConfig } from '../types/api';
import { BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT } from '../constants';
import { chunkArray } from '../utils/helpers';
import { GetOrCreateConfigApiResponse } from '../types/fee-share';
import { CreateQuoteFeeShareConfigParams, QuoteFeeShareConfigResponse, QuoteFeeShareConfigResponseWire } from '../types/fee-share-quotes';
import { decodeQuoteTransactionPlan } from '../utils/fee-share-quotes';
import { validateAndNormalizeCreateFeeShareConfigParams } from '../utils/validations';
import bs58 from 'bs58';

export class ConfigService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	async getConfigCreationLookupTableTransactions(
		args: Pick<BagsGetOrCreateFeeShareConfigArgs, 'feeClaimers' | 'payer'>,
		tipConfig?: TransactionTipConfig,
		maxClaimersNonLut: number = BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT
	): Promise<{ creationTransaction: VersionedTransaction; extendTransactions: Array<VersionedTransaction>; lutAddresses: Array<PublicKey> } | null> {
		if (args.feeClaimers.length <= maxClaimersNonLut) {
			console.warn('A lookup table is not needed for this config creation');
			return null;
		}

		const lutAccounts = args.feeClaimers.map((claimer) => claimer.user);

		const [createLutIx, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
			authority: args.payer,
			payer: args.payer,
			recentSlot: await this.connection.getSlot(this.commitment),
		});

		const recentBlockhash = await this.connection.getLatestBlockhash(this.commitment);

		const createLutTransaction = new VersionedTransaction(
			new TransactionMessage({
				payerKey: args.payer,
				recentBlockhash: recentBlockhash.blockhash,
				instructions: [
					ComputeBudgetProgram.setComputeUnitLimit({
						units: 30_000,
					}),
					ComputeBudgetProgram.setComputeUnitPrice({
						microLamports: 40_000,
					}),
					createLutIx,
					tipConfig
						? SystemProgram.transfer({
								fromPubkey: args.payer,
								toPubkey: tipConfig.tipWallet,
								lamports: tipConfig.tipLamports,
							})
						: undefined,
				].filter(Boolean),
			}).compileToV0Message()
		);

		const lutAccountChunks = chunkArray(lutAccounts, 25);
		const extendTransactions = [];

		for (const chunk of lutAccountChunks) {
			const extendLutIx = AddressLookupTableProgram.extendLookupTable({
				lookupTable: lookupTableAddress,
				authority: args.payer,
				payer: args.payer,
				addresses: chunk,
			});

			const extendLutTransaction = new VersionedTransaction(
				new TransactionMessage({
					payerKey: args.payer,
					recentBlockhash: recentBlockhash.blockhash,
					instructions: [
						ComputeBudgetProgram.setComputeUnitLimit({
							units: 30_000,
						}),
						ComputeBudgetProgram.setComputeUnitPrice({
							microLamports: 40_000,
						}),
						extendLutIx,
						tipConfig
							? SystemProgram.transfer({
									fromPubkey: args.payer,
									toPubkey: tipConfig.tipWallet,
									lamports: tipConfig.tipLamports,
								})
							: undefined,
					].filter(Boolean),
				}).compileToV0Message()
			);

			extendTransactions.push(extendLutTransaction);
		}

		return {
			creationTransaction: createLutTransaction,
			extendTransactions,
			lutAddresses: [lookupTableAddress],
		};
	}

	/**
	 * Get a Bags Fee Share config creation transaction
	 *
	 * @param args The arguments for the config creation
	 * @param tipConfig Optional tip config to use for the config creation transaction
	 * @returns The config creation transaction
	 */
	async createBagsFeeShareConfig(
		args: BagsGetOrCreateFeeShareConfigArgs,
		tipConfig?: TransactionTipConfig
	): Promise<{ transactions: Array<VersionedTransaction>; bundles: Array<Array<VersionedTransaction>>; meteoraConfigKey: PublicKey }> {
		const normalizedParams = validateAndNormalizeCreateFeeShareConfigParams(args, tipConfig);
		const response = await this.bagsApiClient.post<GetOrCreateConfigApiResponse>('/fee-share/config', normalizedParams);

		if (!response.needsCreation) {
			throw new Error('Config already exists');
		}

		const transactions = response.transactions?.map((transaction) => {
			const decodedTransaction = bs58.decode(transaction.transaction);
			return VersionedTransaction.deserialize(decodedTransaction);
		});

		const bundles = response.bundles?.map((bundle) => {
			return bundle.map((transaction) => {
				const decodedTransaction = bs58.decode(transaction.transaction);
				return VersionedTransaction.deserialize(decodedTransaction);
			});
		});

		return {
			transactions,
			bundles,
			meteoraConfigKey: new PublicKey(response.meteoraConfigKey),
		};
	}

	/**
	 * Create (or fetch) a native quote Fee Share config, denominated in any supported quote
	 * mint, not just wrapped SOL.
	 *
	 * Returns a staged transaction plan when `needsCreation` is true: sign and send the
	 * entries in `plan.transactions` in order. If `plan.readiness.status` is `setup_required`,
	 * confirm the setup transaction(s) first, then call this again to fetch the rebuilt plan.
	 * Quote mints must be reviewed for production before a plan can be built for them; see
	 * `TokenLaunchService.getSupportedQuoteTokens`.
	 *
	 * @param params The parameters for the native quote config creation
	 * @returns The config's current state and, if needed, the plan to create it
	 */
	async createQuoteFeeShareConfig(params: CreateQuoteFeeShareConfigParams): Promise<QuoteFeeShareConfigResponse> {
		const response = await this.bagsApiClient.post<QuoteFeeShareConfigResponseWire>('/fee-share/config/v2', {
			transactionFormat: params.transactionFormat,
			feeLimits: params.feeLimits?.map((feeLimit) => ({
				asset: { mint: feeLimit.asset.mint.toBase58(), tokenProgram: feeLimit.asset.tokenProgram.toBase58() },
				basisPoints: feeLimit.basisPoints,
				maximumFeeRaw: feeLimit.maximumFeeRaw,
			})),
			additionalLookupTables: params.additionalLookupTables?.map((table) => table.toBase58()),
			baseMint: params.baseMint.toBase58(),
			payer: params.payer.toBase58(),
			flow: params.flow,
			claimersArray: params.claimersArray.map((claimer) => claimer.toBase58()),
			basisPointsArray: params.basisPointsArray,
			quoteMint: params.quoteMint?.toBase58(),
			quoteTokenProgram: params.quoteTokenProgram?.toBase58(),
			partner: params.partner?.toBase58(),
			partnerConfig: params.partnerConfig?.toBase58(),
			admin: params.admin?.toBase58(),
			bagsConfigType: params.bagsConfigType,
			enableFirstSwapWithMinFee: params.enableFirstSwapWithMinFee,
			tipWallet: params.tipWallet?.toBase58(),
			tipLamports: params.tipLamports,
		});

		return {
			...response,
			feeShareConfig: new PublicKey(response.feeShareConfig),
			feeShareAuthority: new PublicKey(response.feeShareAuthority),
			meteoraConfigKey: response.meteoraConfigKey ? new PublicKey(response.meteoraConfigKey) : null,
			plan: response.plan ? decodeQuoteTransactionPlan(response.plan) : null,
		};
	}
}
