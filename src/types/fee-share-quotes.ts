import { PublicKey, VersionedTransaction } from '@solana/web3.js';

export type NativeQuoteFlow = 'dbc' | 'damm_v2_direct';

export type QuoteFailureCode =
	| 'account_mismatch'
	| 'airdrop_not_ready'
	| 'asset_frozen'
	| 'asset_paused'
	| 'config_locked'
	| 'fee_limit_exceeded'
	| 'graduation_not_ready'
	| 'insufficient_quote'
	| 'insufficient_sol'
	| 'invalid_request'
	| 'metadata_unavailable'
	| 'nothing_to_claim'
	| 'pair_shortfall'
	| 'pending_reconciliation'
	| 'quote_mismatch'
	| 'quote_not_reviewed'
	| 'rpc_unavailable'
	| 'transaction_too_large'
	| 'transfer_restricted'
	| 'unsupported_bot_assignment'
	| 'unsupported_client'
	| 'unsupported_flow'
	| 'unsupported_format'
	| 'unsupported_profile';

export type QuoteAssetRef = {
	mint: string;
	tokenProgram: string;
};

export type QuoteAsset = QuoteAssetRef & {
	decimals: number | null;
};

export type QuoteAvailability = { status: 'available' } | { status: 'restricted' | 'unavailable'; reason: QuoteFailureCode };

export type QuoteFeeLimit = {
	asset: QuoteAssetRef;
	/** Maximum fee for this asset, in basis points. */
	basisPoints: number;
	/** Maximum fee for this asset, as a raw base-unit amount. */
	maximumFeeRaw: string;
};

export type QuoteFeeLimitParams = {
	asset: { mint: PublicKey; tokenProgram: PublicKey };
	basisPoints: number;
	maximumFeeRaw: string;
};

/** Shared, optional transaction-building knobs accepted by every native quote endpoint. */
export type QuoteBuildOptionsParams = {
	/** Requested transaction wire format. Defaults to v0. */
	transactionFormat?: 'v0' | 'v1';
	/** Per-asset maximum fee guards applied while building the transaction plan. Maximum 4 entries. */
	feeLimits?: QuoteFeeLimitParams[];
	/** Extra address lookup tables to compile the transactions against. Maximum 8 entries. */
	additionalLookupTables?: PublicKey[];
};

export type QuotePriorityFee = { unit: 'total_lamports'; amount: string } | { unit: 'micro_lamports_per_compute_unit'; amount: string };

export type QuoteTransactionStageKind = 'config' | 'claim' | 'manager_update' | 'launch' | 'lookup_table_setup';

export interface QuoteTransactionStage {
	/** Identifier for this stage, unique within the plan. */
	id: string;
	kind: QuoteTransactionStageKind;
	/** Ids of stages that must land before this one can be submitted. */
	dependsOn: string[];
	/** Negotiated wire format for this stage's transaction. */
	format: 'v0' | 'v1';
	requiredSigners: string[];
	lifetime: { blockhash: string; lastValidBlockHeight: string };
	budget: {
		computeUnitLimit: number;
		loadedAccountsDataSizeLimit: number;
		priorityFee: QuotePriorityFee;
	};
	size: { bytes: number; accounts: number; signatures: number };
	/** Partially signed transaction, ready to co-sign and send. */
	transaction: VersionedTransaction;
	/** Hex-encoded SHA-256 hash of the transaction's unsigned message bytes. */
	messageSha256: string;
}

/** @internal Wire shape before each stage's transaction is decoded. */
export interface QuoteTransactionStageWire extends Omit<QuoteTransactionStage, 'transaction'> {
	encoding: 'base64';
	transaction: string;
}

export type QuoteTransactionReadiness =
	| { status: 'ready' }
	| {
			status: 'setup_required';
			lookupTables: string[];
			/** Slot after which the lookup table can be relied on, or null while it is still being created. */
			minimumSlotExclusive: string | null;
			/** Confirm the setup transaction(s) in `transactions`, then call this endpoint again to fetch the rebuilt plan. */
			action: 'confirm_setup_refetch_and_rebuild';
	  };

export type QuoteOperation =
	| { kind: 'config'; baseMint: string; flow: NativeQuoteFlow }
	| { kind: 'manager_update'; baseMint: string; flow: NativeQuoteFlow }
	| { kind: 'launch'; baseMint: string; flow: NativeQuoteFlow }
	| { kind: 'holding_claim'; baseMint: string; wallet: string; authority: string }
	| { kind: 'position_claim'; baseMint: string; wallet: string };

/**
 * A staged, potentially multi-transaction plan for a native quote operation. Sign and send the
 * entries in `transactions` in order. If `readiness.status` is `setup_required`, confirm the
 * setup transaction(s) first, then call the endpoint again to fetch the rebuilt plan.
 */
export interface QuoteTransactionPlan {
	contractVersion: 1;
	operation: QuoteOperation;
	asset: QuoteAsset;
	feeLimits: QuoteFeeLimit[];
	transactions: QuoteTransactionStage[];
	readiness: QuoteTransactionReadiness;
}

/** @internal Wire shape before the plan's stages are decoded. */
export interface QuoteTransactionPlanWire extends Omit<QuoteTransactionPlan, 'transactions'> {
	transactions: QuoteTransactionStageWire[];
}

export interface QuoteCapability {
	asset: QuoteAsset;
	/** Unix timestamp (seconds) the asset's on-chain state was last observed, or null if unavailable. */
	observedAt: number | null;
	observedSlot: string;
	flows: {
		flow: NativeQuoteFlow;
		/** Whether the mint's on-chain profile (extensions, freeze state, etc.) is eligible for this flow. */
		profileEligible: boolean;
		/** Whether this asset/flow pairing has been reviewed and approved for production launches. */
		reviewedForLaunch: boolean;
		launchAvailability: QuoteAvailability;
	}[];
}

export interface QuoteCapabilitiesResponse {
	contractVersion: 1;
	tokens: QuoteCapability[];
}

export type QuoteClaimableSource =
	| { kind: 'pair_entitlement'; baseMint: string; config: string; authority: string; claimerIndex: number }
	| { kind: 'pool_estimate'; baseMint: string; pool: string; protocol: 'dbc' | 'damm_v2' }
	| { kind: 'holding_balance'; baseMint: string; authority: string; tokenAccount: string }
	| { kind: 'role_balance'; role: 'partner' | 'deployer'; owner: string; authority: string; tokenAccount: string };

export interface QuoteClaimable {
	id: string;
	wallet: string;
	asset: QuoteAsset;
	source: QuoteClaimableSource;
	/** Claimable amount in raw base units, or null if it could not be observed. */
	rawAmount: string | null;
	/** Reserved for future use. Always null in the current API version. */
	display: null;
	/** Reserved for future use. Always null in the current API version. */
	estimatedNetReceiptRaw: null;
	availability: QuoteAvailability;
	observedSlot: string | null;
	valuation: {
		basis: 'current';
		knownUsd: string;
		status: 'complete' | 'unavailable';
		exclusions: {
			asset: QuoteAsset;
			rawAmount: string | null;
			reason: 'balance_unavailable' | 'missing_price';
			eventCount: null;
		}[];
		staleEstimates: never[];
	};
}

export interface QuoteClaimablesResponse {
	contractVersion: 1;
	wallet: string;
	items: QuoteClaimable[];
	/** True when every source resolved without issue (issues is empty). This endpoint returns 200 even when it isn't. */
	complete: boolean;
	issues: { sourceId: string | null; reason: QuoteFailureCode }[];
}

export interface CreateQuoteFeeShareConfigParams extends QuoteBuildOptionsParams {
	baseMint: PublicKey;
	/** Wallet funding config creation. */
	payer: PublicKey;
	flow: NativeQuoteFlow;
	/** Fee claimer wallet public keys. Must align with basisPointsArray, be unique, and contain 1-100 entries. */
	claimersArray: PublicKey[];
	/** Basis points for each fee claimer. Must align with claimersArray and total 10,000. */
	basisPointsArray: number[];
	/** Quote mint this config is denominated in. Defaults to wrapped SOL. Cannot be changed once issued. */
	quoteMint?: PublicKey;
	quoteTokenProgram?: PublicKey;
	partner?: PublicKey;
	/** Partner config PDA. Required if `partner` is provided. */
	partnerConfig?: PublicKey;
	/** Config manager. Defaults to whichever claimer holds 10,000 bps. */
	admin?: PublicKey;
	/** Bags config type (Meteora fee schedule). See `MeteoraConfigType`. */
	bagsConfigType?: string;
	enableFirstSwapWithMinFee?: boolean;
	tipWallet?: PublicKey;
	tipLamports?: number;
}

export interface QuoteFeeShareConfigResponse {
	contractVersion: 1;
	/** Whether a plan still needs to be signed and sent, or the config is already fully created on-chain. */
	needsCreation: boolean;
	feeShareConfig: PublicKey;
	feeShareAuthority: PublicKey;
	asset: QuoteAsset;
	flow: NativeQuoteFlow;
	/** Derived upstream Meteora DBC config, or null for damm_v2_direct/legacy configs. */
	meteoraConfigKey: PublicKey | null;
	/** Null when `needsCreation` is false because the config already exists on-chain. */
	plan: QuoteTransactionPlan | null;
}

/** @internal Wire shape before `plan` and public keys are decoded. */
export interface QuoteFeeShareConfigResponseWire extends Omit<QuoteFeeShareConfigResponse, 'feeShareConfig' | 'feeShareAuthority' | 'meteoraConfigKey' | 'plan'> {
	feeShareConfig: string;
	feeShareAuthority: string;
	meteoraConfigKey: string | null;
	plan: QuoteTransactionPlanWire | null;
}

export interface UpdateQuoteFeeShareConfigParams extends QuoteBuildOptionsParams {
	baseMint: PublicKey;
	payer: PublicKey;
	claimersArray: PublicKey[];
	basisPointsArray: number[];
}

export interface CreateQuoteLaunchTransactionParams extends QuoteBuildOptionsParams {
	/** Mint from a previous token-info/metadata creation call. */
	tokenMint: PublicKey;
	/** Launch wallet. */
	wallet: PublicKey;
	/** Fee share config to attach to this launch. */
	feeShareConfig: PublicKey;
	/** Quote mint to launch against. Must be reviewed for production; see `getSupportedQuoteTokens`. */
	quoteMint: PublicKey;
	quoteTokenProgram?: PublicKey;
	/** Metadata URI. Must not exceed 200 UTF-8 bytes. */
	metadataUrl: string;
	/** Initial buy amount in raw quote mint base units. */
	initialBuyQuoteRaw?: string;
	tipWallet?: PublicKey;
	tipLamports?: number;
}

export interface CreateQuoteDbcLaunchTransactionParams extends CreateQuoteLaunchTransactionParams {
	/** Reviewed DBC pool config to launch against. */
	configKey: PublicKey;
}

export type QuoteClaimSourceParams =
	| { kind: 'position' }
	| { kind: 'pair' }
	| { kind: 'pool'; protocol: 'dbc' | 'damm_v2'; pool: PublicKey }
	| { kind: 'holding'; authority: PublicKey };

export interface CreateQuoteClaimTransactionParams extends QuoteBuildOptionsParams {
	feeClaimer: PublicKey;
	tokenMint: PublicKey;
	/** Quote mint to claim, when the config supports more than one. */
	quoteMint?: PublicKey;
	/** Which specific claimable source to build a claim for. Omit to let the server pick the default (position/pair) source. */
	source?: QuoteClaimSourceParams;
}
