import { describe, expect, test } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { maxKey, sortKeys } from '../src/utils/fee-share';
import { chunkArray } from '../src/utils/helpers';
import { getFeeVaultPda } from '../src/utils/fee-claim';
import { detectImageInputType, prepareImageForFormData } from '../src/utils/image';
import { isValidUrl, validateAndNormalizeCreateTokenInfoParams } from '../src/utils/validations';
import { BAGS_FEE_SHARE_V2_PROGRAM_ID, BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED } from '../src/constants';

describe('fee-share utils', () => {
	test('maxKey returns the larger public key bytes', () => {
		const smaller = new PublicKey(new Uint8Array(32).fill(1));
		const largerBytes = new Uint8Array(32).fill(1);
		
		largerBytes[0] = 2;
		
		const larger = new PublicKey(largerBytes);

		const result = maxKey(smaller, larger);
		expect(result).toStrictEqual(larger.toBytes());
	});

	test('sortKeys orders keys ascending', () => {
		const smallerBytes = new Uint8Array(32).fill(1);
		const largerBytes = new Uint8Array(32).fill(1);
		
		largerBytes[31] = 255;

		const smaller = new PublicKey(smallerBytes);
		const larger = new PublicKey(largerBytes);

		const { sortedA, sortedB } = sortKeys(larger, smaller);

		expect(sortedA.equals(smaller)).toBe(true);
		expect(sortedB.equals(larger)).toBe(true);
	});
});

describe('helpers utilities', () => {
	test('chunkArray splits arrays into equal sized chunks', () => {
		const chunks = chunkArray([1, 2, 3, 4, 5], 2);

		expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
	});
});

describe('fee-claim utils', () => {
	test('getFeeVaultPda derives PDA deterministically', () => {
		const feeClaimer = new PublicKey('Fj8j9XScg8jB5TfF5fPK3Qw8pGC66oi7A9phei9anez9');
		const baseMint = new PublicKey('So11111111111111111111111111111111111111112');

		const programId = new PublicKey(BAGS_FEE_SHARE_V2_PROGRAM_ID);

		const pda = getFeeVaultPda(feeClaimer, baseMint, programId);

		const [expected] = PublicKey.findProgramAddressSync(
			[Buffer.from(BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED), feeClaimer.toBuffer(), baseMint.toBuffer()],
			programId
		);

		expect(pda.equals(expected)).toBe(true);
	});
});

describe('image utilities', () => {
	test('prepareImageForFormData handles Buffer input', async () => {
		const image = Buffer.from([0, 1, 2, 3]);
		const result = await prepareImageForFormData(image, { filename: 'test.png', contentType: 'image/png' });

		expect(result.buffer).toStrictEqual(image);
		expect(result.filename).toBe('test.png');
		expect(result.contentType).toBe('image/png');
	});

	const hasBlob = typeof Blob !== 'undefined';
	const blobTest = hasBlob ? test : test.skip;

	blobTest('prepareImageForFormData handles Blob input', async () => {
		const blob = new Blob([new Uint8Array([4, 5, 6])], { type: 'image/png' });
		const result = await prepareImageForFormData(blob);

		expect(result.buffer.length).toBeGreaterThan(0);
		expect(result.contentType).toBe('image/png');
	});

	test('detectImageInputType identifies supported inputs', () => {
		const buffer = Buffer.from([7, 8, 9]);
		expect(detectImageInputType(buffer)).toBe('Buffer');

		if (typeof Blob !== 'undefined') {
			const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
			expect(detectImageInputType(blob)).toBe('Blob');
		}
	});
});

describe('validation utilities', () => {
	test('isValidUrl validates basic URLs', () => {
		expect(isValidUrl('https://bags.fm')).toBe(true);
		expect(isValidUrl('not-a-url')).toBe(false);
	});

	test('validateAndNormalizeCreateTokenInfoParams normalizes symbols and retains metadata', () => {
		const payload = validateAndNormalizeCreateTokenInfoParams({
			image: Buffer.from([1, 2, 3]),
			name: 'My Token',
			symbol: 'mint',
			description: 'Test token',
			metadataUrl: 'https://example.com/meta.json',
		});

		expect(payload.kind).toBe('file');
		expect(payload.symbol).toBe('MINT');
		expect(payload.metadataUrl).toBe('https://example.com/meta.json');
	});

	test('validateAndNormalizeCreateTokenInfoParams enforces image XOR imageUrl', () => {
		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				name: 'Token',
				symbol: 'TOK',
				description: 'Example',
				image: Buffer.from([1]),
				imageUrl: 'https://example.com/image.png',
			} as any)
		).toThrow('Provide exactly one of image or imageUrl');

		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				name: 'Token',
				symbol: 'TOK',
				description: 'Example',
				imageUrl: 'invalid-url',
			})
		).toThrow('imageUrl must be a valid URL');
	});

	test('validateAndNormalizeCreateTokenInfoParams enforces name length limits', () => {
		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				image: Buffer.from([1]),
				name: '',
				symbol: 'TOK',
				description: 'Example',
			} as any)
		).toThrow('Name must be at least 1 character');

		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				image: Buffer.from([1]),
				name: 'a'.repeat(33),
				symbol: 'TOK',
				description: 'Example',
			} as any)
		).toThrow('Name must be less than 32 characters');
	});

	test('validateAndNormalizeCreateTokenInfoParams enforces symbol length limits', () => {
		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				image: Buffer.from([1]),
				name: 'Token',
				symbol: '',
				description: 'Example',
			} as any)
		).toThrow('Symbol must be at least 1 character');

		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				image: Buffer.from([1]),
				name: 'Token',
				symbol: 'A'.repeat(11),
				description: 'Example',
			} as any)
		).toThrow('Symbol must be less than 10 characters');
	});

	test('validateAndNormalizeCreateTokenInfoParams enforces description length limits', () => {
		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				image: Buffer.from([1]),
				name: 'Token',
				symbol: 'TOK',
				description: '',
			} as any)
		).toThrow('Description must be at least 1 character');

		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				image: Buffer.from([1]),
				name: 'Token',
				symbol: 'TOK',
				description: 'a'.repeat(1001),
			} as any)
		).toThrow('Description must be less than 1000 characters');
	});

	test('validateAndNormalizeCreateTokenInfoParams validates metadataUrl when provided', () => {
		expect(() =>
			validateAndNormalizeCreateTokenInfoParams({
				image: Buffer.from([1]),
				name: 'Token',
				symbol: 'TOK',
				description: 'Example',
				metadataUrl: 'not-a-url',
			} as any)
		).toThrow('metadataUrl must be a valid URL');
	});

	test('validateAndNormalizeCreateTokenInfoParams returns url payload when imageUrl provided', () => {
		const payload = validateAndNormalizeCreateTokenInfoParams({
			imageUrl: 'https://example.com/image.png',
			name: 'Token',
			symbol: 'tok',
			description: 'Example',
		});

		expect(payload.kind).toBe('url');
		
		if (payload.kind !== 'url') {
			throw new Error('Expected url payload');
		}

		expect(payload.imageUrl).toBe('https://example.com/image.png');
	});

	test('validateAndNormalizeCreateTokenInfoParams preserves optional social fields', () => {
		const payload = validateAndNormalizeCreateTokenInfoParams({
			image: Buffer.from([1]),
			name: 'Token',
			symbol: 'tok',
			description: 'Example',
			telegram: 'https://t.me/bags',
			twitter: 'https://x.com/bagsxyz',
			website: 'https://bags.fm',
		});

		expect(payload.telegram).toBe('https://t.me/bags');
		expect(payload.twitter).toBe('https://x.com/bagsxyz');
		expect(payload.website).toBe('https://bags.fm');
	});

	test('validateAndNormalizeCreateTokenInfoParams validates optional social fields', () => {
		const base = {
			image: Buffer.from([1]),
			name: 'Token',
			symbol: 'tok',
			description: 'Example',
		};

		expect(() => validateAndNormalizeCreateTokenInfoParams({ ...base, twitter: 'not-a-url' } as any)).toThrow(
			'twitter must be a valid URL'
		);
		expect(() => validateAndNormalizeCreateTokenInfoParams({ ...base, telegram: 'not-a-url' } as any)).toThrow(
			'telegram must be a valid URL'
		);
		expect(() => validateAndNormalizeCreateTokenInfoParams({ ...base, website: 'not-a-url' } as any)).toThrow(
			'website must be a valid URL'
		);
	});
});

