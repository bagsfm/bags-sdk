import { Commitment, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BaseService } from './base';
import { GetClaimTransactionForTokenRequest, MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault } from '../types/meteora';
import { getFeeVaultPda, getMyMeteoraTokenLaunchesAndFees } from '../utils/fee-claim';
import { BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT } from '../constants';
import { ClaimTransactionApiResponse } from '../types';
import bs58 from 'bs58';

export class FeesService extends BaseService {
	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		super(apiKey, connection, commitment);
	}

	/**
	 * Get claimable positions for a wallet
	 *
	 * @param wallet The public key of the wallet to check
	 * @param chunkSize The number of GPA calls to make in parallel, default is 5 (adjust based on your RPC rate limits)
	 * @returns Array of claimable positions with fee information
	 */
	async getAllClaimablePositions(wallet: PublicKey, chunkSize: number = 5): Promise<Array<MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault>> {
		const response = await getMyMeteoraTokenLaunchesAndFees(
			wallet.toBase58(),
			this.dbcProgram,
			this.dammV2Program,
			this.bagsMeteoraFeeClaimer,
			this.commitment,
			this.connection,
			(feeClaimerVaults: Array<PublicKey>) => this.stateService.getPoolConfigKeysByFeeClaimerVaults(feeClaimerVaults),
			chunkSize
		);
		return response;
	}

	/**
	 * Get claim transaction for a position
	 *
	 * @param wallet The public key of the wallet claiming fees
	 * @param position The position to claim fees from (you can fetch positions via @getMyClaimablePositions)
	 * @returns Array of versioned transactions to claim fees
	 */
	async getClaimTransaction(wallet: PublicKey, position: MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault): Promise<Array<VersionedTransaction>> {
		const params: Partial<GetClaimTransactionForTokenRequest> = {
			feeClaimer: wallet.toBase58(),
			tokenMint: position.baseMint,
		};

		if (position.virtualPoolClaimableAmount) {
			params.claimVirtualPoolFees = true;
			params.virtualPoolAddress = position.virtualPoolAddress;
		}

		if (position.dammPoolClaimableAmount) {
			params.claimDammV2Fees = true;
			params.dammV2Position = position.dammPositionInfo!.position.toBase58();
			params.dammV2Pool = position.dammPositionInfo!.pool.toBase58();
			params.dammV2PositionNftAccount = position.dammPositionInfo!.positionNftAccount.toBase58();
			params.tokenAMint = position.dammPositionInfo!.tokenAMint.toBase58();
			params.tokenBMint = position.dammPositionInfo!.tokenBMint.toBase58();
			params.tokenAVault = position.dammPositionInfo!.tokenAVault.toBase58();
			params.tokenBVault = position.dammPositionInfo!.tokenBVault.toBase58();
		}

		if (position.isCustomFeeVault) {
			params.isCustomFeeVault = true;

			params.customFeeVaultClaimerA = position.customFeeVaultClaimerA?.toBase58();
			params.customFeeVaultClaimerB = position.customFeeVaultClaimerB?.toBase58();
			params.customFeeVaultClaimerSide = position.customFeeVaultClaimerSide;

			// Edge case, the fee vault has a balance but token might not be migrated, and virtual curve could be empty
			// We set claimVirtualPoolFees to true
			const userFeeVaultPda = getFeeVaultPda(
				position.customFeeVaultClaimerSide === 'A' ? position.customFeeVaultClaimerA : position.customFeeVaultClaimerB,
				new PublicKey(position.baseMint),
				this.bagsMeteoraFeeClaimer.programId
			);

			if (!userFeeVaultPda) {
				console.error('Error deriving user fee vault pda');
				return null;
			}

			const userFeeVaultPdaBalance = await this.connection.getBalance(userFeeVaultPda as PublicKey, this.commitment);
			const hasFeesInVault = userFeeVaultPdaBalance >= BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT;

			if (hasFeesInVault) {
				params.claimVirtualPoolFees = true;
				params.virtualPoolAddress = position.virtualPoolAddress;
			}
		}

		const response = await this.bagsApiClient.post<ClaimTransactionApiResponse>('/token-launch/claim-txs', params as GetClaimTransactionForTokenRequest);

		const deserializedVersionedTransactions = response.map((tx) => {
			const decodedTransaction = bs58.decode(tx.tx);
			return VersionedTransaction.deserialize(decodedTransaction);
		});

		return deserializedVersionedTransactions;
	}
}
