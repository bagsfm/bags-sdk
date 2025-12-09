import { describe, expect, test } from 'vitest';
import { getTestConnection, getTestSdk } from './helpers/sdk';

describe('BagsSDK', () => {
	test('initializes reusable service instances', () => {
		const sdk = getTestSdk('processed');

		expect(sdk.bagsApiClient).toBeDefined();
		expect(sdk.tokenLaunch).toBeDefined();
		expect(sdk.state).toBeDefined();
		expect(sdk.config).toBeDefined();
		expect(sdk.fee).toBeDefined();
		expect(sdk.partner).toBeDefined();
	});

	test('state service shares connection and commitment', () => {
		const sdk = getTestSdk();
		const connection = getTestConnection();

		expect(sdk.state.getConnection()).toBe(connection);
		expect(sdk.state.getCommitment()).toBe('processed');
	});
});
