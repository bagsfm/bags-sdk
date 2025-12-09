import { PublicKey } from '@solana/web3.js';

/**
 * Returns the larger of two public keys by comparing their byte arrays
 * @param left First public key to compare
 * @param right Second public key to compare
 * @returns The bytes of the larger public key
 */
export function maxKey(left: PublicKey, right: PublicKey): Uint8Array {
	const leftBytes = left.toBytes();
	const rightBytes = right.toBytes();

	for (let i = 0; i < 32; i++) {
		if (leftBytes[i] > rightBytes[i]) {
			return leftBytes;
		} else if (leftBytes[i] < rightBytes[i]) {
			return rightBytes;
		}
	}

	return leftBytes;
}
/**
 * Returns keyA and keyB ordered so that sortedA is the smaller public key (by byte comparison)
 * @param keyA First public key to compare
 * @param keyB Second public key to compare
 * @returns Object containing the sorted public keys
 */

export function sortKeys(keyA: PublicKey, keyB: PublicKey): { sortedA: PublicKey; sortedB: PublicKey } {
	const aBytes = keyA.toBytes();
	const bBytes = keyB.toBytes();

	for (let i = 0; i < 32; i++) {
		if (aBytes[i] < bBytes[i]) {
			return { sortedA: keyA, sortedB: keyB };
		} else if (aBytes[i] > bBytes[i]) {
			return { sortedA: keyB, sortedB: keyA };
		}
	}

	return { sortedA: keyA, sortedB: keyB };
}
