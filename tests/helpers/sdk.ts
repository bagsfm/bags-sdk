import { Commitment, Connection } from '@solana/web3.js';
import { BagsSDK } from '../../src';
import { testEnv } from './env';

let cachedConnection: Connection | null = null;
let cachedSdk: BagsSDK | null = null;

export function getTestConnection(commitment: Commitment = 'processed'): Connection {
	if (!cachedConnection) {
		cachedConnection = new Connection(testEnv.solanaRpcUrl, commitment);
	}

	return cachedConnection;
}

export function getTestSdk(commitment: Commitment = 'processed'): BagsSDK {
	if (!cachedSdk) {
		cachedSdk = new BagsSDK(testEnv.bagsApiKey, getTestConnection(commitment), commitment);
	}

	return cachedSdk;
}

export function resetTestSdk(): void {
	cachedSdk = null;
	cachedConnection = null;
}