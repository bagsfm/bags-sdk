import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		testTimeout: 120_000,
		hookTimeout: 120_000,
		sequence: {
			shuffle: false,
		}
	},
});

