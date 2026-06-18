import { BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT } from '../constants';
import {
	BagsGetOrCreateFeeShareConfigArgs,
	CreateDexscreenerOrderParams,
	CreateTokenInfoParams,
	GetTradeQuoteParams,
	BAGS_CONFIG_TYPE,
	INCORPORATION_CATEGORIES,
	IncorporateParams,
	NormalizedCreateDexscreenerOrderParams,
	NormalizedCreateFeeShareConfigParams,
	NormalizedCreateTokenInfoParams,
	NormalizedGetTradeQuoteParams,
	NormalizedIncorporateParams,
	NormalizedStartPaymentParams,
	StartPaymentParams,
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

	if (params.bagsConfigType && !Object.values(BAGS_CONFIG_TYPE).includes(params.bagsConfigType)) {
		throw new Error('bagsConfigType must be a valid BAGS_CONFIG_TYPE');
	}

	if (params.enableFirstSwapWithMinFee !== undefined && typeof params.enableFirstSwapWithMinFee !== 'boolean') {
		throw new Error('enableFirstSwapWithMinFee must be a boolean');
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
		admin: params.admin?.toBase58() ?? undefined,
		bagsConfigType: params.bagsConfigType ?? BAGS_CONFIG_TYPE.DEFAULT_96_LOCKED,
		enableFirstSwapWithMinFee: params.enableFirstSwapWithMinFee,
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

export function validateAndNormalizeCreateDexscreenerOrderParams(params: CreateDexscreenerOrderParams): NormalizedCreateDexscreenerOrderParams {
	if (!params.description || typeof params.description !== 'string' || params.description.length < 1) {
		throw new Error('Description must be at least 1 character');
	}

	if (params.description.length > 1000) {
		throw new Error('Description must be less than 1000 characters');
	}

	if (!isValidUrl(params.iconImageUrl)) {
		throw new Error('iconImageUrl must be a valid URL');
	}

	if (!isValidUrl(params.headerImageUrl)) {
		throw new Error('headerImageUrl must be a valid URL');
	}

	if (params.links) {
		for (const link of params.links) {
			if (!isValidUrl(link.url)) {
				throw new Error('Each link url must be a valid URL');
			}

			if (link.label !== undefined && link.label.length > 100) {
				throw new Error('Link label must be less than 100 characters');
			}
		}
	}

	return {
		tokenAddress: params.tokenAddress.toBase58(),
		description: params.description,
		iconImageUrl: params.iconImageUrl,
		headerImageUrl: params.headerImageUrl,
		payerWallet: params.payerWallet.toBase58(),
		links: params.links,
		payWithSol: params.payWithSol,
	};
}

export function validateAndNormalizeStartPaymentParams(params: StartPaymentParams): NormalizedStartPaymentParams {
	if (!params.payerWallet) {
		throw new Error('payerWallet is required');
	}

	return {
		payerWallet: params.payerWallet.toBase58(),
		payWithSol: params.payWithSol,
	};
}

export function validateAndNormalizeIncorporateParams(params: IncorporateParams): NormalizedIncorporateParams {
	if (!params.orderUUID || typeof params.orderUUID !== 'string' || params.orderUUID.trim().length < 1) {
		throw new Error('Order UUID is required');
	}

	if (!params.paymentSignature || typeof params.paymentSignature !== 'string' || params.paymentSignature.trim().length < 1) {
		throw new Error('Payment signature is required');
	}

	if (!params.projectName || typeof params.projectName !== 'string' || params.projectName.trim().length < 1) {
		throw new Error('Project name is required');
	}
	if (params.projectName.length > 200) {
		throw new Error('Project name must be at most 200 characters');
	}

	if (!params.tokenAddress) {
		throw new Error('Token address is required');
	}

	if (!Array.isArray(params.founders) || params.founders.length < 1) {
		throw new Error('At least one founder is required');
	}
	if (params.founders.length > 10) {
		throw new Error('At most 10 founders are allowed');
	}

	for (const founder of params.founders) {
		if (!founder.firstName || typeof founder.firstName !== 'string' || founder.firstName.trim().length < 1) {
			throw new Error('Founder first name is required');
		}
		if (founder.firstName.length > 100) {
			throw new Error('Founder first name must be at most 100 characters');
		}
		if (!founder.lastName || typeof founder.lastName !== 'string' || founder.lastName.trim().length < 1) {
			throw new Error('Founder last name is required');
		}
		if (founder.lastName.length > 100) {
			throw new Error('Founder last name must be at most 100 characters');
		}
		if (!founder.email || typeof founder.email !== 'string') {
			throw new Error('Founder email is required');
		}
		if (!founder.nationalityCountry || founder.nationalityCountry.trim().length !== 3) {
			throw new Error('Founder nationality country must be an ISO 3166-1 alpha-3 code');
		}
		if (!founder.taxResidencyCountry || founder.taxResidencyCountry.trim().length !== 3) {
			throw new Error('Founder tax residency country must be an ISO 3166-1 alpha-3 code');
		}
		if (!founder.residentialAddress || typeof founder.residentialAddress !== 'string' || founder.residentialAddress.trim().length < 1) {
			throw new Error('Founder residential address is required');
		}
		if (founder.residentialAddress.length > 500) {
			throw new Error('Founder residential address must be at most 500 characters');
		}
		if (!Number.isInteger(founder.shareBasisPoint) || founder.shareBasisPoint < 0 || founder.shareBasisPoint > 10000) {
			throw new Error('Founder share basis points must be an integer between 0 and 10000');
		}
	}

	if (!Number.isInteger(params.incorporationShareBasisPoint) || params.incorporationShareBasisPoint < 2000 || params.incorporationShareBasisPoint > 3000) {
		throw new Error('Incorporation share must be between 2000 (20%) and 3000 (30%)');
	}

	const founderBps = params.founders.reduce((sum, f) => sum + f.shareBasisPoint, 0);
	if (founderBps + params.incorporationShareBasisPoint !== 10000) {
		throw new Error('Total of founder shares and incorporation shares must equal 10000 basis points (100%)');
	}

	if (!Array.isArray(params.preferredCompanyNames) || params.preferredCompanyNames.length !== 3) {
		throw new Error('Exactly 3 preferred company names are required');
	}
	for (const name of params.preferredCompanyNames) {
		if (!name || typeof name !== 'string' || name.trim().length < 1) {
			throw new Error('Company name must not be empty');
		}
		if (name.length > 200) {
			throw new Error('Company name must be at most 200 characters');
		}
	}

	if (params.category !== undefined && !(INCORPORATION_CATEGORIES as readonly string[]).includes(params.category)) {
		throw new Error(`Category must be one of: ${INCORPORATION_CATEGORIES.join(', ')}`);
	}

	if (params.twitterHandle !== undefined) {
		if (params.twitterHandle.length > 50) {
			throw new Error('Twitter handle must be at most 50 characters');
		}
		if (!/^[a-zA-Z0-9_]*$/.test(params.twitterHandle)) {
			throw new Error('Twitter handle must be alphanumeric and underscores only');
		}
	}

	return {
		orderUUID: params.orderUUID,
		paymentSignature: params.paymentSignature,
		projectName: params.projectName.trim(),
		tokenAddress: params.tokenAddress.toBase58(),
		founders: params.founders.map((f) => ({
			firstName: f.firstName.trim(),
			lastName: f.lastName.trim(),
			email: f.email.trim().toLowerCase(),
			nationalityCountry: f.nationalityCountry.trim(),
			taxResidencyCountry: f.taxResidencyCountry.trim(),
			residentialAddress: f.residentialAddress.trim(),
			shareBasisPoint: f.shareBasisPoint,
		})),
		category: params.category,
		twitterHandle: params.twitterHandle?.trim(),
		incorporationShareBasisPoint: params.incorporationShareBasisPoint,
		preferredCompanyNames: params.preferredCompanyNames.map((n) => n.trim()),
	};
}
