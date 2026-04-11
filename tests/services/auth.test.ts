import { describe, expect, test } from 'vitest';
import { getTestSdk } from '../helpers/sdk';

describe('AuthService integration', () => {
	test('me returns user data for the API key owner', async () => {
		const { auth } = getTestSdk();
		const response = await auth.me();

		expect(response.user).toBeDefined();
		expect(typeof response.user.uuid).toBe('string');
		expect(response.user.uuid.length).toBeGreaterThan(0);
		expect(typeof response.user.username).toBe('string');
		expect(response.user.username.length).toBeGreaterThan(0);
		expect(typeof response.user.twitter_data.verified).toBe('boolean');
		expect(typeof response.user.twitter_data.followers_count).toBe('number');
	});
});
