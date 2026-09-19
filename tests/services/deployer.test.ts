import { describe, expect, test } from 'vitest';
import { VersionedTransaction } from '@solana/web3.js';
import { getTestSdk } from '../helpers/sdk';
import { testEnv } from '../helpers/env';

describe('DeployerService integration', () => {
	test('getClaimablePositions returns decimal-string balances for a wallet', async () => {
		const claimable = await getTestSdk().deployer.getClaimablePositions(testEnv.launchWallet);

		expect(claimable.wallet).toBe(testEnv.launchWallet.toBase58());
		expect(Array.isArray(claimable.positions)).toBe(true);
		expect(() => BigInt(claimable.vaultClaimableLamports)).not.toThrow();
		expect(() => BigInt(claimable.unattributedVaultLamports)).not.toThrow();
		expect(() => BigInt(claimable.totalClaimableLamports)).not.toThrow();

		claimable.positions.forEach((position) => {
			expect(typeof position.tokenMint).toBe('string');
			expect(() => BigInt(position.pendingDbcLamports)).not.toThrow();
			expect(() => BigInt(position.pendingDammLamports)).not.toThrow();
			expect(() => BigInt(position.accruedLamports)).not.toThrow();
			expect(() => BigInt(position.totalClaimableLamports)).not.toThrow();
		});
	});

	test('getClaimTransactions returns a claim plan shape, even with nothing to claim', async () => {
		const plan = await getTestSdk().deployer.getClaimTransactions(testEnv.launchWallet, { maxTransactions: 5 });

		expect(plan.wallet).toBe(testEnv.launchWallet.toBase58());
		expect(plan.transactionVersion).toBe(0);
		expect(Array.isArray(plan.remainingTokenMints)).toBe(true);
		expect(Array.isArray(plan.deferredClaims)).toBe(true);

		plan.transactions.forEach(({ transaction, blockhash }) => {
			expect(transaction).toBeInstanceOf(VersionedTransaction);
			expect(typeof blockhash.blockhash).toBe('string');
			expect(blockhash.blockhash.length).toBeGreaterThan(0);
			expect(typeof blockhash.lastValidBlockHeight).toBe('number');
		});

		plan.deferredClaims.forEach((deferred) => {
			expect(['dbc', 'dammV2', 'vault']).toContain(deferred.protocol);
			expect(['needs_wallet_sol', 'simulation_failed', 'batch_limit']).toContain(deferred.reason);
		});
	});
});
