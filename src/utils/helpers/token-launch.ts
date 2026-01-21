import { Keypair, LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { BagsSDK } from '../../client';
import { BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT } from '../../constants';
import type { SupportedSocialProvider } from '../../types/api';
import type { ImageInput } from '../image';
import { waitForSlotsToPass } from './solana';
import { createTipTransaction, sendBundleAndConfirm, signAndSendTransaction } from './transaction';

const DEFAULT_JITO_TIP_LAMPORTS = 0.015 * LAMPORTS_PER_SOL;

/**
 * Fee claimer configuration using social provider lookup
 */
export interface FeeClaimerInput {
	provider: SupportedSocialProvider;
	username: string;
	bps: number;
}

/**
 * Parameters for launching a token
 */
export interface LaunchTokenParams {
	/** Token name */
	name: string;
	/** Token symbol (will be uppercased, $ prefix removed) */
	symbol: string;
	/** Token description */
	description: string;
	/** Image URL or image input (File, Blob, Buffer) */
	image: string | ImageInput;
	/** Twitter/X URL */
	twitterUrl?: string;
	/** Website URL */
	websiteUrl?: string;
	/** Telegram URL */
	telegramUrl?: string;
	/** Initial buy amount in lamports */
	initialBuyAmountLamports: number;
	/**
	 * Creator's share of trading fees in basis points.
	 * Combined with feeClaimers BPS, must equal exactly 10000 (100%).
	 */
	creatorBps: number;
	/**
	 * Optional fee claimers who will receive trading fees.
	 * Each entry specifies a social provider, username, and their share in basis points.
	 * Combined with creatorBps, must equal exactly 10000 (100%).
	 */
	feeClaimers?: FeeClaimerInput[];
	/** Optional partner wallet address for fee sharing */
	partner?: PublicKey;
	/** Optional partner config PDA (derived using deriveBagsFeeShareV2PartnerConfigPda) */
	partnerConfig?: PublicKey;
}

/**
 * Result of a successful token launch
 */
export interface LaunchTokenResult {
	/** The token mint public key */
	tokenMint: PublicKey;
	/** The launch transaction signature */
	signature: string;
	/** The metadata URI */
	metadataUri: string;
	/** The fee share config key */
	configKey: PublicKey;
}

/**
 * Sends a bundle with a Jito tip transaction prepended
 */
async function sendBundleWithTip(
	unsignedTransactions: VersionedTransaction[],
	keypair: Keypair,
	sdk: BagsSDK
): Promise<string> {
	const connection = sdk.state.getConnection();
	const commitment = sdk.state.getCommitment();

	const bundleBlockhash = unsignedTransactions[0]?.message.recentBlockhash;

	if (!bundleBlockhash) {
		throw new Error('Bundle transactions must have a blockhash');
	}

	let jitoTip = DEFAULT_JITO_TIP_LAMPORTS;

	const recommendedJitoTip = await sdk.solana.getJitoRecentFees().catch((): null => null);

	if (recommendedJitoTip?.landed_tips_95th_percentile) {
		jitoTip = Math.floor(recommendedJitoTip.landed_tips_95th_percentile * LAMPORTS_PER_SOL);
	}

	const tipTransaction = await createTipTransaction(connection, commitment, keypair.publicKey, jitoTip, {
		blockhash: bundleBlockhash,
	});

	const signedTransactions = [tipTransaction, ...unsignedTransactions].map((tx) => {
		tx.sign([keypair]);
		return tx;
	});

	return sendBundleAndConfirm(signedTransactions, sdk);
}

/**
 * Creates or retrieves a fee share config for a token
 */
async function getOrCreateFeeShareConfig(
	sdk: BagsSDK,
	keypair: Keypair,
	tokenMint: PublicKey,
	feeClaimers: Array<{ user: PublicKey; userBps: number }>,
	partner?: PublicKey,
	partnerConfig?: PublicKey
): Promise<PublicKey> {
	const connection = sdk.state.getConnection();
	const commitment = sdk.state.getCommitment();

	let additionalLookupTables: PublicKey[] | undefined;

	if (feeClaimers.length > BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT) {
		const lutResult = await sdk.config.getConfigCreationLookupTableTransactions({
			payer: keypair.publicKey,
			baseMint: tokenMint,
			feeClaimers,
		});

		if (!lutResult) {
			throw new Error('Failed to create lookup table transactions');
		}

		await signAndSendTransaction(connection, commitment, lutResult.creationTransaction, keypair);

		await waitForSlotsToPass(connection, commitment, 1);

		for (const extendTx of lutResult.extendTransactions) {
			await signAndSendTransaction(connection, commitment, extendTx, keypair);
		}

		additionalLookupTables = lutResult.lutAddresses;
	}

	const configResult = await sdk.config.createBagsFeeShareConfig({
		payer: keypair.publicKey,
		baseMint: tokenMint,
		feeClaimers,
		partner,
		partnerConfig,
		additionalLookupTables,
	});

	if (configResult.bundles?.length) {
		for (const bundle of configResult.bundles) {
			await sendBundleWithTip(bundle, keypair, sdk);
		}
	}

	for (const tx of configResult.transactions || []) {
		await signAndSendTransaction(connection, commitment, tx, keypair);
	}

	return configResult.meteoraConfigKey;
}

/**
 * Resolves fee claimer inputs to wallet addresses and adds creator.
 * Validates that creatorBps + feeClaimers BPS equals exactly 10000 (100%).
 */
async function resolveFeeClaimers(
	sdk: BagsSDK,
	creatorWallet: PublicKey,
	creatorBps: number,
	feeClaimerInputs?: FeeClaimerInput[]
): Promise<Array<{ user: PublicKey; userBps: number }>> {
	// Calculate total BPS
	const feeClaimersBps = feeClaimerInputs?.reduce((sum, fc) => sum + fc.bps, 0) ?? 0;
	const totalBps = creatorBps + feeClaimersBps;

	if (totalBps !== 10000) {
		throw new Error(`Total BPS (creatorBps + feeClaimers) must equal exactly 10000 (100%), got ${totalBps}`);
	}

	if (creatorBps < 0 || creatorBps > 10000) {
		throw new Error(`Creator BPS must be between 0 and 10000, got ${creatorBps}`);
	}

	if (feeClaimerInputs?.some((fc) => fc.bps < 0 || fc.bps > 10000)) {
		throw new Error(
			`Fee claimer BPS must be between 0 and 10000, got ${feeClaimerInputs.find((fc) => fc.bps < 0 || fc.bps > 10000)?.bps}`
		);
	}

	const feeClaimers: Array<{ user: PublicKey; userBps: number }> = [];

	if (creatorBps > 0) {
		feeClaimers.push({ user: creatorWallet, userBps: creatorBps });
	}

	if (feeClaimerInputs?.length) {
		const walletResults = await sdk.state.getLaunchWalletV2Bulk(
			feeClaimerInputs.map((fc) => ({ username: fc.username, provider: fc.provider }))
		);

		for (const input of feeClaimerInputs) {
			const result = walletResults.find(
				(r) =>
					r.username.toLowerCase() === input.username.toLowerCase() &&
					r.provider.toLowerCase() === input.provider.toLowerCase()
			);

			if (!result?.wallet) {
				throw new Error(`Failed to resolve wallet for ${input.provider}:${input.username}`);
			}

			feeClaimers.push({
				user: result.wallet,
				userBps: input.bps,
			});
		}
	}

	return feeClaimers;
}

/**
 * Launches a token on Bags with optional fee sharing.
 *
 * This function handles the complete token launch flow:
 * 1. Creates token metadata
 * 2. Sets up fee share configuration (with optional fee claimers)
 * 3. Creates and sends the launch transaction
 *
 * @param sdk - The initialized BagsSDK instance
 * @param keypair - The keypair to sign transactions (will be the token creator)
 * @param params - Token launch parameters
 * @returns Launch result containing token mint, signature, and metadata URI
 *
 * @example
 * ```typescript
 * // Launch with all fees going to creator
 * const result = await launchToken(sdk, keypair, {
 *   name: "My Token",
 *   symbol: "MTK",
 *   description: "My awesome token",
 *   image: "https://example.com/image.png",
 *   initialBuyAmountLamports: 0.01 * LAMPORTS_PER_SOL,
 *   creatorBps: 10000, // 100% to creator
 * });
 *
 * // Launch with fee sharing (creatorBps + feeClaimers must total exactly 10000 bps)
 * const result = await launchToken(sdk, keypair, {
 *   name: "Shared Token",
 *   symbol: "STK",
 *   description: "Token with shared fees",
 *   image: "https://example.com/image.png",
 *   initialBuyAmountLamports: 0.01 * LAMPORTS_PER_SOL,
 *   creatorBps: 5000, // 50% to creator
 *   feeClaimers: [
 *     { provider: "twitter", username: "user1", bps: 3000 }, // 30%
 *     { provider: "twitter", username: "user2", bps: 2000 }, // 20%
 *   ],
 * });
 * ```
 */
export async function launchToken(
	sdk: BagsSDK,
	keypair: Keypair,
	params: LaunchTokenParams
): Promise<LaunchTokenResult> {
	const connection = sdk.state.getConnection();
	const commitment = sdk.state.getCommitment();

	// Step 1: Create metadata
	const isImageUrl = typeof params.image === 'string';

	const tokenInfoResponse = await sdk.tokenLaunch.createTokenInfoAndMetadata({
		...(isImageUrl ? { imageUrl: params.image as string } : { image: params.image as ImageInput }),
		name: params.name,
		description: params.description,
		symbol: params.symbol.toUpperCase(),
		twitter: params.twitterUrl,
		website: params.websiteUrl,
		telegram: params.telegramUrl,
	});

	const tokenMint = new PublicKey(tokenInfoResponse.tokenMint);

	// Step 2: Resolve fee claimers and create config
	const feeClaimers = await resolveFeeClaimers(sdk, keypair.publicKey, params.creatorBps, params.feeClaimers);

	const configKey = await getOrCreateFeeShareConfig(
		sdk,
		keypair,
		tokenMint,
		feeClaimers,
		params.partner,
		params.partnerConfig
	);

	// Step 3: Create and send launch transaction
	const launchTransaction = await sdk.tokenLaunch.createLaunchTransaction({
		metadataUrl: tokenInfoResponse.tokenMetadata,
		tokenMint,
		launchWallet: keypair.publicKey,
		initialBuyLamports: params.initialBuyAmountLamports,
		configKey,
	});

	const signature = await signAndSendTransaction(connection, commitment, launchTransaction, keypair);

	return {
		tokenMint,
		signature,
		metadataUri: tokenInfoResponse.tokenMetadata,
		configKey,
	};
}
