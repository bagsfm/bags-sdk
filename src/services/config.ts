import { AddressLookupTableProgram, Commitment, ComputeBudgetProgram, Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import type { BagsGetOrCreateFeeShareConfigArgs, TransactionTipConfig } from '../types/api';
import { BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT } from '../constants';
import { chunkArray } from '../utils/helpers';
import { GetOrCreateConfigApiResponse } from '../types/fee-share';
import { validateAndNormalizeCreateFeeShareConfigParams } from '../utils/validations';
import bs58 from 'bs58';

export class ConfigService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	async getConfigCreationLookupTableTransactions(
		args: Exclude<BagsGetOrCreateFeeShareConfigArgs, 'additionalLookupTables'>,
		tipConfig?: TransactionTipConfig
	): Promise<{ creationTransaction: VersionedTransaction; extendTransactions: Array<VersionedTransaction>; lutAddresses: Array<PublicKey> } | null> {
		if (args.feeClaimers.length <= BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT) {
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
}
