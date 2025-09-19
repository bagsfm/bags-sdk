import { CreateTokenInfoParams, NormalizedCreateTokenInfoParams } from "../types";

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (_e) {
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
    const hasImage = 'image' in params && typeof (params as any).image !== 'undefined';
    const hasImageUrl = 'imageUrl' in params && typeof (params as any).imageUrl !== 'undefined';

    if ((hasImage && hasImageUrl) || (!hasImage && !hasImageUrl)) {
        throw new Error('Provide exactly one of image or imageUrl');
    }

    // Optional url validations
    if (hasImageUrl) {
        const url = (params as any).imageUrl as string;
        if (!isValidUrl(url)) {
            throw new Error('imageUrl must be a valid URL');
        }
    }

    if ('metadataUrl' in params && typeof (params as any).metadataUrl !== 'undefined') {
        const url = (params as any).metadataUrl as string;
        if (!isValidUrl(url)) {
            throw new Error('metadataUrl must be a valid URL');
        }
    }

    const base = {
        name: params.name,
        symbol: symbolUpper,
        description: params.description,
        telegram: params.telegram,
        twitter: params.twitter,
        website: params.website,
        metadataUrl: (params as any).metadataUrl,
    };

    if (hasImage) {
        return { kind: 'file', image: (params as any).image, ...base };
    }

    return { kind: 'url', imageUrl: (params as any).imageUrl, ...base };
}
