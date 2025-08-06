import { Commitment, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { derivePositionAddress, getUnClaimReward } from '@meteora-ag/cp-amm-sdk';
import { Program, ProgramAccount } from '@coral-xyz/anchor';
import { PoolConfig, VirtualPool } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { AccountLayout, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { BagsMeteoraFeeClaimer } from '../idl/bags-meteora-fee-claimer/idl';
import type { DynamicBondingCurve } from '../idl/dynamic-bonding-curve/idl';
import type { DammV2 } from '../idl/damm-v2/idl';
import { CustomFeeVault, DammV2PositionByPool, MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault } from '../types/meteora';
import BN from 'bn.js';
import { BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED, BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT, METEORA_DBC_MIGRATION_DAMM_V2_CREATOR } from '../constants';

export async function getFeeVaultFromVaultAuthorityAndClaimer(
	vaultAuthority: string,
	claimer: string,
	bagsMeteoraFeeClaimerProgram: Program<BagsMeteoraFeeClaimer>
): Promise<Array<ProgramAccount>> {
	const feeVaultResult = await bagsMeteoraFeeClaimerProgram.account.vault.all([
		{
			memcmp: {
				offset: 8,
				bytes: vaultAuthority,
			},
		},
		{
			memcmp: {
				offset: 40,
				bytes: claimer,
			},
		},
	]);

	if (feeVaultResult.length === 0) {
		throw new Error('Custom fee vault not found');
	}

	return feeVaultResult;
}

export async function fetchFeeVaultData(vaultAuthority: string, claimer: string, bagsMeteoraFeeClaimerProgram: Program<BagsMeteoraFeeClaimer>) {
	const feeVaultResult = await getFeeVaultFromVaultAuthorityAndClaimer(vaultAuthority, claimer, bagsMeteoraFeeClaimerProgram);

	if (feeVaultResult.length === 0) {
		throw new Error('Custom fee vault not found');
	}

	return feeVaultResult;
}

export async function getPoolFeeMetrics(
	poolAddress: PublicKey,
	meteoraDbcProgram: Program<DynamicBondingCurve>,
	commitment: Commitment
): Promise<{
	current: {
		partnerBaseFee: BN;
		partnerQuoteFee: BN;
		creatorBaseFee: BN;
		creatorQuoteFee: BN;
	};
	total: {
		totalTradingBaseFee: BN;
		totalTradingQuoteFee: BN;
	};
}> {
	const pool = await meteoraDbcProgram.account.virtualPool.fetchNullable(poolAddress, commitment);

	if (!pool) {
		throw new Error(`Pool not found: ${poolAddress.toString()}`);
	}

	return {
		current: {
			partnerBaseFee: pool.partnerBaseFee,
			partnerQuoteFee: pool.partnerQuoteFee,
			creatorBaseFee: pool.creatorBaseFee,
			creatorQuoteFee: pool.creatorQuoteFee,
		},
		total: {
			totalTradingBaseFee: pool.metrics.totalTradingBaseFee,
			totalTradingQuoteFee: pool.metrics.totalTradingQuoteFee,
		},
	};
}

export async function getAllPositionNftAccountByOwner(
	connection: Connection,
	commitment: Commitment,
	user: PublicKey
): Promise<
	Array<{
		positionNft: PublicKey;
		positionNftAccount: PublicKey;
	}>
> {
	const tokenAccounts = await connection.getTokenAccountsByOwner(
		user,
		{
			programId: TOKEN_2022_PROGRAM_ID,
		},
		{
			commitment,
		}
	);

	const userPositionNftAccount: Array<{
		positionNft: PublicKey;
		positionNftAccount: PublicKey;
	}> = [];
	for (const { account, pubkey } of tokenAccounts.value) {
		const tokenAccountData = AccountLayout.decode(account.data);

		if (tokenAccountData.amount.toString() === '1') {
			userPositionNftAccount.push({
				positionNft: tokenAccountData.mint,
				positionNftAccount: pubkey,
			});
		}
	}

	return userPositionNftAccount;
}

export async function getUserPositionByPool(
	dammV2Pool: PublicKey,
	user: PublicKey,
	dammV2Program: Program<DammV2>,
	connection: Connection,
	commitment: Commitment
): Promise<Array<DammV2PositionByPool>> {
	const userPositionAccounts = await getAllPositionNftAccountByOwner(connection, commitment, user);

	if (userPositionAccounts.length === 0) {
		return [];
	}

	const positionAddresses = userPositionAccounts.map((account) => derivePositionAddress(account.positionNft));

	const positionStates = await dammV2Program.account.position.fetchMultiple(positionAddresses);

	const positionResult = userPositionAccounts
		.map((account, index) => {
			const positionState = positionStates[index];
			if (!positionState) return null;

			return {
				positionNftAccount: account.positionNftAccount,
				position: positionAddresses[index],
				positionState,
			};
		})
		.filter(Boolean);

	positionResult.sort((a, b) => {
		const totalLiquidityA = a.positionState.vestedLiquidity.add(a.positionState.permanentLockedLiquidity).add(a.positionState.unlockedLiquidity);

		const totalLiquidityB = b.positionState.vestedLiquidity.add(b.positionState.permanentLockedLiquidity).add(b.positionState.unlockedLiquidity);

		return totalLiquidityB.cmp(totalLiquidityA);
	});

	return positionResult.filter((position) => position.positionState.pool.equals(dammV2Pool));
}

async function processVirtualPool(
	virtualPool: ProgramAccount<VirtualPool>,
	creator: string,
	feeVaultTokenMints: Array<string>,
	feeVaultsAsA: Array<ProgramAccount<CustomFeeVault>>,
	feeVaultsAsB: Array<ProgramAccount<CustomFeeVault>>,
	meteoraDbcProgram: Program<DynamicBondingCurve>,
	bagsMeteoraFeeClaimerProgram: Program<BagsMeteoraFeeClaimer>,
	dammV2Program: Program<DammV2>,
	commitment: Commitment,
	connection: Connection
): Promise<Array<MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault> | null> {
	try {
		const poolFeeMetricsPromise = await getPoolFeeMetrics(virtualPool.publicKey, meteoraDbcProgram, commitment);
		const virtualPoolClaimableAmount = poolFeeMetricsPromise.current.partnerQuoteFee.toNumber() / LAMPORTS_PER_SOL;

		const isCustomFeeVault = feeVaultTokenMints.includes(virtualPool.account.baseMint.toBase58());

		let customFeeVaultBps = 0;
		let customFeeVaultClaimOwner;
		let customFeeVaultClaimerA;
		let customFeeVaultClaimerB;
		let customFeeVaultClaimerSide: 'A' | 'B';

		let customFeeVault: PublicKey;
		let customFeeVaultBalance: number;

		if (isCustomFeeVault) {
			const customFeeVaultAsA = feeVaultsAsA.find((vault) => vault.account.mint.toBase58() === virtualPool.account.baseMint.toBase58());
			const customFeeVaultAsB = feeVaultsAsB.find((vault) => vault.account.mint.toBase58() === virtualPool.account.baseMint.toBase58());

			if (customFeeVaultAsA) {
				customFeeVaultBps = customFeeVaultAsA.account.claimerABps;
				customFeeVaultClaimOwner = customFeeVaultAsA.publicKey;

				customFeeVaultClaimerA = customFeeVaultAsA.account.claimerA;
				customFeeVaultClaimerB = customFeeVaultAsA.account.claimerB;

				const feeVaultResult = await fetchFeeVaultData(customFeeVaultAsA.publicKey.toBase58(), customFeeVaultAsA.account.claimerA.toBase58(), bagsMeteoraFeeClaimerProgram);

				if (feeVaultResult.length === 0) {
					throw new Error('Custom fee vault not found');
				}

				customFeeVault = feeVaultResult[0].publicKey;

				customFeeVaultClaimerSide = 'A';

				const feeVaultBalanceRaw = (await connection.getBalance(customFeeVault, commitment)) - BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT;

				customFeeVaultBalance = Math.max(feeVaultBalanceRaw, 0) / LAMPORTS_PER_SOL;
			} else if (customFeeVaultAsB) {
				customFeeVaultBps = customFeeVaultAsB.account.claimerBBps;
				customFeeVaultClaimOwner = customFeeVaultAsB.publicKey;

				customFeeVaultClaimerA = customFeeVaultAsB.account.claimerA;
				customFeeVaultClaimerB = customFeeVaultAsB.account.claimerB;

				const feeVaultResult = await fetchFeeVaultData(customFeeVaultAsB.publicKey.toBase58(), customFeeVaultAsB.account.claimerB.toBase58(), bagsMeteoraFeeClaimerProgram);

				if (feeVaultResult.length === 0) {
					throw new Error('Custom fee vault not found');
				}

				customFeeVault = feeVaultResult[0].publicKey;

				customFeeVaultClaimerSide = 'B';

				const feeVaultBalanceRaw = (await connection.getBalance(customFeeVault, commitment)) - BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT;

				customFeeVaultBalance = Math.max(feeVaultBalanceRaw, 0) / LAMPORTS_PER_SOL;
			} else {
				throw new Error('Custom fee vault not found');
			}
		}

		if (!virtualPool.account.isMigrated) {
			if (isCustomFeeVault) {
				return [
					{
						virtualPool: virtualPool.publicKey.toBase58(),
						baseMint: virtualPool.account.baseMint.toBase58(),
						virtualPoolClaimableAmount,
						virtualPoolAddress: virtualPool.publicKey.toBase58(),
						isMigrated: false,
						isCustomFeeVault: true,
						customFeeVaultBps: customFeeVaultBps,
						customFeeVaultClaimOwner: customFeeVaultClaimOwner!,
						customFeeVaultClaimerA: customFeeVaultClaimerA!,
						customFeeVaultClaimerB: customFeeVaultClaimerB!,
						customFeeVaultClaimerSide: customFeeVaultClaimerSide!,
						claimableDisplayAmount: virtualPoolClaimableAmount * (customFeeVaultBps / 10000) + customFeeVaultBalance!,
						customFeeVault: customFeeVault!,
						customFeeVaultBalance: customFeeVaultBalance!,
					},
				];
			} else {
				return [
					{
						virtualPool: virtualPool.publicKey.toBase58(),
						baseMint: virtualPool.account.baseMint.toBase58(),
						virtualPoolClaimableAmount,
						virtualPoolAddress: virtualPool.publicKey.toBase58(),
						isMigrated: false,
						isCustomFeeVault: false,
						claimableDisplayAmount: virtualPoolClaimableAmount,
					},
				];
			}
		}

		const dammPools = await dammV2Program.account.pool.all([
			{
				memcmp: {
					offset: 168,
					bytes: virtualPool.account.baseMint.toBase58(),
				},
			},
			{
				memcmp: {
					// Creator field
					offset: 328,
					bytes: METEORA_DBC_MIGRATION_DAMM_V2_CREATOR.toBase58(),
				},
			},
		]);

		if (!dammPools.length) {
			console.error(`Damm pool not found for virtual pool that migrated ${virtualPool.publicKey.toBase58()}`);

			if (isCustomFeeVault) {
				return [
					{
						virtualPool: virtualPool.publicKey.toBase58(),
						baseMint: virtualPool.account.baseMint.toBase58(),
						virtualPoolClaimableAmount,
						virtualPoolAddress: virtualPool.publicKey.toBase58(),
						isMigrated: true,
						isCustomFeeVault: true,
						customFeeVaultBps: customFeeVaultBps,
						customFeeVaultClaimOwner: customFeeVaultClaimOwner!,
						customFeeVaultClaimerA: customFeeVaultClaimerA!,
						customFeeVaultClaimerB: customFeeVaultClaimerB!,
						customFeeVaultClaimerSide: customFeeVaultClaimerSide!,
						claimableDisplayAmount: virtualPoolClaimableAmount * (customFeeVaultBps / 10000) + customFeeVaultBalance!,
						customFeeVault: customFeeVault!,
						customFeeVaultBalance: customFeeVaultBalance!,
					},
				];
			} else {
				return [
					{
						virtualPool: virtualPool.publicKey.toBase58(),
						baseMint: virtualPool.account.baseMint.toBase58(),
						virtualPoolClaimableAmount,
						virtualPoolAddress: virtualPool.publicKey.toBase58(),
						isMigrated: true,
						isCustomFeeVault: false,
						claimableDisplayAmount: virtualPoolClaimableAmount,
					},
				];
			}
		}

		const allDammPoolClaimableAmounts: Array<MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault> = [];

		for (const dammPool of dammPools) {
			try {
				let pool;
				let userPositions;

				if (isCustomFeeVault) {
					[pool, userPositions] = await Promise.all([
						dammV2Program.account.pool.fetchNullable(dammPool.publicKey, commitment),
						getUserPositionByPool(dammPool.publicKey, customFeeVaultClaimOwner!, dammV2Program, connection, commitment),
					]);
				} else {
					[pool, userPositions] = await Promise.all([
						dammV2Program.account.pool.fetchNullable(dammPool.publicKey, commitment),
						getUserPositionByPool(dammPool.publicKey, new PublicKey(creator), dammV2Program, connection, commitment),
					]);
				}

				if (!userPositions.length) {
					console.error(`No user positions found for virtual pool ${virtualPool.publicKey.toBase58()}`);
					if (isCustomFeeVault) {
						allDammPoolClaimableAmounts.push({
							virtualPool: virtualPool.publicKey.toBase58(),
							baseMint: virtualPool.account.baseMint.toBase58(),
							virtualPoolClaimableAmount,
							virtualPoolAddress: virtualPool.publicKey.toBase58(),
							isMigrated: true,
							isCustomFeeVault: true,
							customFeeVaultBps: customFeeVaultBps,
							customFeeVaultClaimOwner: customFeeVaultClaimOwner!,
							customFeeVaultClaimerA: customFeeVaultClaimerA!,
							customFeeVaultClaimerB: customFeeVaultClaimerB!,
							customFeeVaultClaimerSide: customFeeVaultClaimerSide!,
							claimableDisplayAmount: (virtualPoolClaimableAmount + customFeeVaultBalance!) * (customFeeVaultBps / 10000),
							customFeeVault: customFeeVault!,
							customFeeVaultBalance: customFeeVaultBalance!,
						});
					} else {
						allDammPoolClaimableAmounts.push({
							virtualPool: virtualPool.publicKey.toBase58(),
							baseMint: virtualPool.account.baseMint.toBase58(),
							virtualPoolClaimableAmount,
							virtualPoolAddress: virtualPool.publicKey.toBase58(),
							isMigrated: true,
							isCustomFeeVault: false,
							claimableDisplayAmount: virtualPoolClaimableAmount,
						});
					}
				}

				const unClaimReward = await getUnClaimReward(pool as any, userPositions[0].positionState);
				const dammPoolClaimableAmount = unClaimReward.feeTokenB.toNumber() / LAMPORTS_PER_SOL;

				if (isCustomFeeVault) {
					allDammPoolClaimableAmounts.push({
						virtualPool: virtualPool.publicKey.toBase58(),
						baseMint: virtualPool.account.baseMint.toBase58(),
						virtualPoolClaimableAmount,
						dammPoolClaimableAmount,
						virtualPoolAddress: virtualPool.publicKey.toBase58(),
						dammPoolAddress: dammPool.publicKey.toBase58(),
						dammPositionInfo: {
							owner: new PublicKey(creator),
							position: userPositions[0].position,
							pool: userPositions[0].positionState.pool,
							positionNftAccount: userPositions[0].positionNftAccount,
							tokenAMint: pool!.tokenAMint,
							tokenBMint: pool!.tokenBMint,
							tokenAVault: pool!.tokenAVault,
							tokenBVault: pool!.tokenBVault,
							tokenAProgram: TOKEN_PROGRAM_ID,
							tokenBProgram: TOKEN_PROGRAM_ID,
						},
						isMigrated: true,
						isCustomFeeVault: true,
						customFeeVaultBps: customFeeVaultBps,
						customFeeVaultClaimOwner: customFeeVaultClaimOwner!,
						customFeeVaultClaimerA: customFeeVaultClaimerA!,
						customFeeVaultClaimerB: customFeeVaultClaimerB!,
						customFeeVaultClaimerSide: customFeeVaultClaimerSide!,
						claimableDisplayAmount: (virtualPoolClaimableAmount + dammPoolClaimableAmount + customFeeVaultBalance!) * (customFeeVaultBps / 10000),
						customFeeVault: customFeeVault!,
						customFeeVaultBalance: customFeeVaultBalance!,
					});
				} else {
					allDammPoolClaimableAmounts.push({
						virtualPool: virtualPool.publicKey.toBase58(),
						baseMint: virtualPool.account.baseMint.toBase58(),
						virtualPoolClaimableAmount,
						dammPoolClaimableAmount,
						virtualPoolAddress: virtualPool.publicKey.toBase58(),
						dammPoolAddress: dammPool.publicKey.toBase58(),
						dammPositionInfo: {
							owner: new PublicKey(creator),
							position: userPositions[0].position,
							pool: userPositions[0].positionState.pool,
							positionNftAccount: userPositions[0].positionNftAccount,
							tokenAMint: pool!.tokenAMint,
							tokenBMint: pool!.tokenBMint,
							tokenAVault: pool!.tokenAVault,
							tokenBVault: pool!.tokenBVault,
							tokenAProgram: TOKEN_PROGRAM_ID,
							tokenBProgram: TOKEN_PROGRAM_ID,
						},
						isMigrated: true,
						isCustomFeeVault: false,
						claimableDisplayAmount: virtualPoolClaimableAmount + dammPoolClaimableAmount,
					});
				}
			} catch (error) {
				console.error(`Error processing damm pool ${dammPool.publicKey.toBase58()}: ${error}`);
			}
		}

		return allDammPoolClaimableAmounts;
	} catch (error) {
		console.error(`Error processing virtual pool: ${error}`);
		return null;
	}
}

const mergeMeteoraLaunches = (launches: Array<MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault>): Array<MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault> => {
	const mergedMap = new Map<string, MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault>();

	for (const launch of launches) {
		const existingLaunch = mergedMap.get(launch.virtualPool);

		if (!existingLaunch) {
			mergedMap.set(launch.virtualPool, launch);
			continue;
		}

		// If both have the same virtualPoolClaimableAmount, we should merge them
		if (existingLaunch.virtualPoolClaimableAmount === launch.virtualPoolClaimableAmount) {
			// Keep the one with more information (the one with dammPoolInfo)
			if (launch.dammPositionInfo && !existingLaunch.dammPositionInfo) {
				mergedMap.set(launch.virtualPool, launch);
			} else if (!launch.dammPositionInfo && existingLaunch.dammPositionInfo) {
				// Keep existing as it has more info
				continue;
			}
		} else {
			// If virtualPoolClaimableAmount is different, treat as separate positions
			mergedMap.set(launch.virtualPool, launch);
		}
	}

	return Array.from(mergedMap.values());
};

export async function getMyMeteoraTokenLaunchesAndFees(
	creator: string,
	meteoraDbcProgram: Program<DynamicBondingCurve>,
	dammV2Program: Program<DammV2>,
	bagsMeteoraFeeClaimerProgram: Program<BagsMeteoraFeeClaimer>,
	commitment: Commitment,
	connection: Connection
): Promise<Array<MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault>> {
	if (!creator || creator.length === 0) {
		throw new Error('Creator is required');
	}

	try {
		const configsCreatedByUser: Array<ProgramAccount<PoolConfig>> = [];

		const configsCreatedDirectlyByUser = await meteoraDbcProgram.account.poolConfig.all([
			{
				memcmp: {
					// fee_claimer account
					offset: 40,
					bytes: creator,
				},
			},
		]);

		const feeVaultsForUserAsA = await bagsMeteoraFeeClaimerProgram.account.feeAuthority.all([
			{
				memcmp: {
					// claimer_a
					offset: 8,
					bytes: creator,
				},
			},
		]);

		const feeVaultsForUserAsB = await bagsMeteoraFeeClaimerProgram.account.feeAuthority.all([
			{
				memcmp: {
					// claimer_b
					offset: 40,
					bytes: creator,
				},
			},
		]);

		const feeVaults = [...feeVaultsForUserAsA, ...feeVaultsForUserAsB];
		const feeVaultTokenMints = [...feeVaults.map((vault) => vault.account.mint.toBase58())];
		const allFeeVaultKeys = [...feeVaults.map((vault) => vault.publicKey)];

		const configsForFeeVaults = await Promise.all(
			allFeeVaultKeys.map((vault) =>
				meteoraDbcProgram.account.poolConfig.all([
					{
						memcmp: {
							offset: 40,
							bytes: vault.toBase58(),
						},
					},
				])
			)
		).then((results) => results.flat());

		configsCreatedByUser.push(...configsCreatedDirectlyByUser, ...configsForFeeVaults);

		const allVirtualPools = await Promise.all(
			configsCreatedByUser.map((config) => {
				return meteoraDbcProgram.account.virtualPool.all([
					{
						memcmp: {
							// config account
							offset: 72,
							bytes: config.publicKey.toBase58(),
						},
					},
				]);
			})
		);

		const virtualPools = allVirtualPools.flat();

		const chunkSize = 10;
		const chunkedPools = Array.from({ length: Math.ceil(virtualPools.length / chunkSize) }, (_, i) => virtualPools.slice(i * chunkSize, (i + 1) * chunkSize));
		const chunkResults = await Promise.all(
			chunkedPools.map((chunk) =>
				Promise.all(
					chunk.map((pool) =>
						processVirtualPool(
							pool,
							creator,
							feeVaultTokenMints,
							feeVaultsForUserAsA,
							feeVaultsForUserAsB,
							meteoraDbcProgram,
							bagsMeteoraFeeClaimerProgram,
							dammV2Program,
							commitment,
							connection
						)
					)
				)
			)
		);

		const results = chunkResults
			.flat()
			.flat()
			.filter((result): result is MeteoraDbcClaimablePositionWithOrWithoutCustomFeeVault => result !== null);

		const mergedResults = mergeMeteoraLaunches(results);

		return mergedResults.sort((a, b) => b.claimableDisplayAmount - a.claimableDisplayAmount);
	} catch (error) {
		console.error('Error fetching Meteora virtual pools:', error);
		throw error;
	}
}

export function getFeeVaultPda(feeClaimer: PublicKey, baseMint: PublicKey, programId: PublicKey): PublicKey {
	return PublicKey.findProgramAddressSync([Buffer.from(BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED), feeClaimer.toBuffer(), baseMint.toBuffer()], programId)[0];
}
