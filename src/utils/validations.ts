import { BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT } from '../constants';
import {
	BagsGetOrCreateFeeShareConfigArgs,
	CreateTokenInfoParams,
	GetTradeQuoteParams,
	NormalizedCreateFeeShareConfigParams,
	NormalizedCreateTokenInfoParams,
	NormalizedGetTradeQuoteParams,
	TransactionTipConfig,
} from '../types';

export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function validateAndNormalizeCreateTokenInfoParams(params: CreateTokenInfoParams): NormalizedCreateTokenInfoParams {
	// Name validation: 1..32
	if (!params.name || typeof params.name !== 'string' || params.name.length < 1) {
		throw new Error('Name must be at least 1 character');
	}
	if (params.name.length > 32) {
		throw new Error('Name must be less than 32 characters');
	}

	// Symbol: 1..10, uppercase transformation
	if (!params.symbol || typeof params.symbol !== 'string' || params.symbol.length < 1) {
		throw new Error('Symbol must be at least 1 character');
	}
	if (params.symbol.length > 10) {
		throw new Error('Symbol must be less than 10 characters');
	}

	const symbolUpper = params.symbol.toUpperCase();

	// Description: 1..1000
	if (!params.description || typeof params.description !== 'string' || params.description.length < 1) {
		throw new Error('Description must be at least 1 character');
	}

	if (params.description.length > 1000) {
		throw new Error('Description must be less than 1000 characters');
	}

	// Either image or imageUrl
	const hasImage = 'image' in params && typeof params.image !== 'undefined';
	const hasImageUrl = 'imageUrl' in params && typeof params.imageUrl !== 'undefined';

	if ((hasImage && hasImageUrl) || (!hasImage && !hasImageUrl)) {
		throw new Error('Provide exactly one of image or imageUrl');
	}

	// Optional url validations
	if (hasImageUrl) {
		const url = params.imageUrl as string;
		if (!isValidUrl(url)) {
			throw new Error('imageUrl must be a valid URL');
		}
	}

	if ('metadataUrl' in params && typeof params.metadataUrl !== 'undefined') {
		const url = params.metadataUrl as string;
		if (!isValidUrl(url)) {
			throw new Error('metadataUrl must be a valid URL');
		}
	}

	// Validate twitter, telegram, and website are valid urls
	if (params.twitter && !isValidUrl(params.twitter)) {
		throw new Error('twitter must be a valid URL');
	}
	if (params.telegram && !isValidUrl(params.telegram)) {
		throw new Error('telegram must be a valid URL');
	}
	if (params.website && !isValidUrl(params.website)) {
		throw new Error('website must be a valid URL');
	}

	const base = {
		name: params.name,
		symbol: symbolUpper,
		description: params.description,
		telegram: params.telegram,
		twitter: params.twitter,
		website: params.website,
		metadataUrl: params.metadataUrl,
	};

	if (hasImage) {
		return { kind: 'file', image: params.image, ...base };
	}

	return { kind: 'url', imageUrl: params.imageUrl, ...base };
}

export function validateAndNormalizeCreateFeeShareConfigParams(params: BagsGetOrCreateFeeShareConfigArgs, tipConfig?: TransactionTipConfig): NormalizedCreateFeeShareConfigParams {
	const totalBps = params.feeClaimers.reduce((acc, claimer) => acc + claimer.userBps, 0);

	if (totalBps !== 10000) {
		throw new Error('Total BPS must be 10000');
	}

	const totalFeeClaimers = params.feeClaimers.length;

	if (totalFeeClaimers > 100) {
		throw new Error('Total fee claimers must be less than 100');
	}

	if (totalFeeClaimers > BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT && (!params.additionalLookupTables || params.additionalLookupTables.length === 0)) {
		throw new Error('Total fee claimers exceeds BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT; please provide an additional lookup tables.');
	}

	if (params.partner || params.partnerConfig) {
		if (!params.partner) {
			throw new Error('partner is required when partnerConfig is provided');
		}
		if (!params.partnerConfig) {
			throw new Error('partnerConfig is required when partner is provided');
		}
	}

	return {
		basisPointsArray: params.feeClaimers.map((claimer) => claimer.userBps),
		payer: params.payer.toBase58(),
		baseMint: params.baseMint.toBase58(),
		partner: params.partner?.toBase58(),
		partnerConfig: params.partnerConfig?.toBase58(),
		claimersArray: params.feeClaimers.map((claimer) => claimer.user.toBase58()),
		tipWallet: tipConfig?.tipWallet?.toBase58(),
		tipLamports: tipConfig?.tipLamports,
		additionalLookupTables: params.additionalLookupTables?.map((lookupTable) => lookupTable.toBase58()),
	};
}

export function validateAndNormalizeGetTradeQuoteParams(params: GetTradeQuoteParams): NormalizedGetTradeQuoteParams {
	const amount = Number(params.amount);

	if (!Number.isFinite(amount)) {
		throw new Error('amount must be a valid number');
	}

	const slippageMode = params.slippageMode ?? 'auto';

	let normalizedSlippageBps: number | undefined;

	if (params.slippageBps !== undefined) {
		const slippageBps = Number(params.slippageBps);

		if (!Number.isFinite(slippageBps)) {
			throw new Error('slippageBps must be a valid number');
		}

		if (slippageBps < 0 || slippageBps > 10_000) {
			throw new Error('slippageBps must be between 0 and 10000');
		}

		normalizedSlippageBps = slippageBps;
	} else if (slippageMode === 'manual') {
		throw new Error('slippageBps is required when slippageMode is manual');
	}

	const normalized: NormalizedGetTradeQuoteParams = {
		inputMint: params.inputMint.toBase58(),
		outputMint: params.outputMint.toBase58(),
		amount,
		slippageMode,
	};

	if (typeof normalizedSlippageBps === 'number') {
		normalized.slippageBps = normalizedSlippageBps;
	}

	return normalized;
}
