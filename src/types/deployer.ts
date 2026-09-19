import { PublicKey } from '@solana/web3.js';
import { TransactionWithBlockhash } from './api';

export type DeployerClaimablePosition = {
	/** Base mint that generated these fees. */
	tokenMint: string;
	/** Deployer share pending in the bonding-curve pool, as decimal lamports. */
	pendingDbcLamports: string;
	/** Deployer share pending across DAMM v2 positions, as decimal lamports. */
	pendingDammLamports: string;
	/** Unclaimed vault accrual attributed to this token, as decimal lamports. */
	accruedLamports: string;
	/** Sum of both pending fields and accruedLamports. */
	totalClaimableLamports: string;
};

export type DeployerClaimableResponseData = {
	/** Wallet whose configured deployer entitlement is checked on-chain. */
	wallet: string;
	/** WSOL mint; only SOL fee-share v2 revenue is supported. */
	quoteMint: string;
	/** Positive token totals, ordered by tokenMint; not paginated. */
	positions: DeployerClaimablePosition[];
	/** Aggregate vault balance, including all attributed and unattributed funds. */
	vaultClaimableLamports: string;
	/** Vault funds outside recorded token accrual, such as direct deposits. */
	unattributedVaultLamports: string;
	/** Sum of position totals plus unattributedVaultLamports. */
	totalClaimableLamports: string;
};

export type DeployerClaimProtocol = 'dbc' | 'dammV2' | 'vault';

export type DeployerDeferredClaimReason = 'needs_wallet_sol' | 'simulation_failed' | 'batch_limit';

export type DeployerDeferredClaim = {
	/** Base mint, or null for a wallet-wide vault-only withdrawal. */
	tokenMint: string | null;
	/** Source of the deferred claim. */
	protocol: DeployerClaimProtocol;
	/** Required wallet funds, unsuccessful simulation, or a batch limit. */
	reason: DeployerDeferredClaimReason;
	/** Estimated additional wallet SOL, as decimal lamports, when known. */
	additionalSolLamports?: string;
};

export type DeployerClaimTransactionsResponseData = {
	/** Deployer wallet that receives proceeds and signs every transaction. */
	wallet: string;
	/** WSOL mint; withdrawals unwrap the proceeds to native SOL. */
	quoteMint: string;
	/** Ordered version-0 transactions, already partially signed by the sponsor. */
	transactions: TransactionWithBlockhash[];
	/** Selected token mints whose pending pool claims were deferred. */
	remainingTokenMints: string[];
	/** Claims omitted from the returned transaction array. */
	deferredClaims: DeployerDeferredClaim[];
	/** Solana transaction message version. */
	transactionVersion: 0;
};

export type GetDeployerClaimTransactionsOptions = {
	/** Limit pending pool collection to these base mints; vault sweeps are always wallet-wide. */
	tokenMints?: PublicKey[];
	/** Maximum number of transactions to return (1-20, default 10). */
	maxTransactions?: number;
};
