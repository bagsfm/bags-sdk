const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
	js.configs.recommended,
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				project: './tsconfig.json',
			},
			globals: {
				console: 'readonly',
				Buffer: 'readonly',
				process: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			prettier: prettier,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...prettierConfig.rules,
			'prettier/prettier': 'error',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'no-useless-catch': 'warn',
		},
	},
	{
		ignores: ['dist/', 'node_modules/', '*.js', '*.min.js', '*.min.css', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
	},
];
