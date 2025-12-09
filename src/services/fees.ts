import { Commitment, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { BaseService } from './base';
import { BagsClaimablePosition, GetClaimTransactionForTokenRequest } from '../types/meteora';
import { getFeeVaultPda } from '../utils/fee-claim';
import { BAGS_FEE_SHARE_V1_PROGRAM_ID, BAGS_FEE_SHARE_V2_PROGRAM_ID, BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT } from '../constants';
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
	 * @returns Array of claimable positions with fee information
	 */
	async getAllClaimablePositions(wallet: PublicKey): Promise<Array<BagsClaimablePosition>> {
		const response = await this.bagsApiClient.get<Array<BagsClaimablePosition>>('/token-launch/claimable-positions', {
			params: {
				wallet: wallet.toBase58(),
			},
		});

		return response;
	}

	/**
	 * Get claim transaction for a position
	 *
	 * @param wallet The public key of the wallet claiming fees
	 * @param position The position to claim fees from (you can fetch positions via @getAllClaimablePositions)
	 * @returns Array of versioned transactions to claim fees
	 */
	async getClaimTransaction(wallet: PublicKey, position: BagsClaimablePosition): Promise<Array<Transaction>> {
		const params: Partial<GetClaimTransactionForTokenRequest> = {
			feeClaimer: wallet.toBase58(),
			tokenMint: position.baseMint,
		};

		if (position.isCustomFeeVault === false) {
			if (position.virtualPoolClaimableAmount) {
				params.claimVirtualPoolFees = true;
				params.virtualPoolAddress = position.virtualPoolAddress;
			}

			if (position.dammPoolClaimableAmount) {
				params.claimDammV2Fees = true;
				params.dammV2Position = position.dammPositionInfo.position;
				params.dammV2Pool = position.dammPositionInfo.pool;
				params.dammV2PositionNftAccount = position.dammPositionInfo.positionNftAccount;
				params.tokenAMint = position.dammPositionInfo.tokenAMint;
				params.tokenBMint = position.dammPositionInfo.tokenBMint;
				params.tokenAVault = position.dammPositionInfo.tokenAVault;
				params.tokenBVault = position.dammPositionInfo.tokenBVault;
			}
		} else if (position.programId === BAGS_FEE_SHARE_V1_PROGRAM_ID) {
			params.feeShareProgramId = position.programId;
			params.isCustomFeeVault = true;

			if (position.virtualPoolClaimableAmount) {
				params.claimVirtualPoolFees = true;
				params.virtualPoolAddress = position.virtualPoolAddress;
			}

			if (position.dammPoolClaimableAmount) {
				params.claimDammV2Fees = true;
				params.dammV2Position = position.dammPositionInfo.position;
				params.dammV2Pool = position.dammPositionInfo.pool;
				params.dammV2PositionNftAccount = position.dammPositionInfo.positionNftAccount;
				params.tokenAMint = position.dammPositionInfo.tokenAMint;
				params.tokenBMint = position.dammPositionInfo.tokenBMint;
				params.tokenAVault = position.dammPositionInfo.tokenAVault;
				params.tokenBVault = position.dammPositionInfo.tokenBVault;
			}

			params.customFeeVaultClaimerA = position.customFeeVaultClaimerA;
			params.customFeeVaultClaimerB = position.customFeeVaultClaimerB;
			params.customFeeVaultClaimerSide = position.customFeeVaultClaimerSide;

			const userFeeVaultPda = getFeeVaultPda(
				position.customFeeVaultClaimerSide === 'A' ? new PublicKey(position.customFeeVaultClaimerA) : new PublicKey(position.customFeeVaultClaimerB),
				new PublicKey(position.baseMint),
				new PublicKey(position.programId)
			);

			const userFeeVaultPdaBalance = await this.connection.getBalance(userFeeVaultPda as PublicKey, this.commitment);
			const hasFeesInVault = userFeeVaultPdaBalance >= BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT;

			if (hasFeesInVault) {
				params.claimVirtualPoolFees = true;
				params.virtualPoolAddress = position.virtualPoolAddress;
			}
		} else if (position.programId === BAGS_FEE_SHARE_V2_PROGRAM_ID) {
			params.feeShareProgramId = position.programId;
			params.isCustomFeeVault = true;

			params.tokenAMint = position.baseMint;
			params.tokenBMint = position.quoteMint;

			if (position.virtualPoolClaimableLamportsUserShare) {
				params.claimVirtualPoolFees = true;
				params.virtualPoolAddress = position.virtualPool;
			}

			if (position.isMigrated && position.dammPoolClaimableLamportsUserShare) {
				params.claimDammV2Fees = true;
				params.dammV2Pool = position.dammPositionInfo.pool;
				params.dammV2Position = position.dammPositionInfo.position;
				params.dammV2PositionNftAccount = position.dammPositionInfo.positionNftAccount;
				params.tokenAMint = position.dammPositionInfo.tokenAMint;
				params.tokenBMint = position.dammPositionInfo.tokenBMint;
				params.tokenAVault = position.dammPositionInfo.tokenAVault;
				params.tokenBVault = position.dammPositionInfo.tokenBVault;
			}
		} else {
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			throw new Error(`Unsupported program ID: ${(position as any).programId}. Expected '${BAGS_FEE_SHARE_V1_PROGRAM_ID}' or '${BAGS_FEE_SHARE_V2_PROGRAM_ID}'`);
		}

		const response = await this.bagsApiClient.post<ClaimTransactionApiResponse>('/token-launch/claim-txs/v2', params as GetClaimTransactionForTokenRequest);

		const deserializedTransactions = response.map((tx) => {
			const decodedTransaction = bs58.decode(tx.tx);
			return Transaction.from(decodedTransaction);
		});

		return deserializedTransactions;
	}
}
