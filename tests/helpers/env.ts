import { PublicKey } from '@solana/web3.js';
import { cleanEnv, str } from 'envalid';

const rawTestEnv = cleanEnv(process.env, {
	SOLANA_RPC_URL: str(),
	BAGS_API_KEY: str(),
	BAGS_TEST_TOKEN_MINT: str(),
	BAGS_TEST_QUOTE_MINT: str(),
	BAGS_TEST_SOCIAL_USERNAME: str(),
	BAGS_TEST_FEE_WALLET: str(),
	BAGS_TEST_LAUNCH_WALLET: str(),
	BAGS_TEST_CONFIG_KEY: str(),
	BAGS_TEST_PARTNER_KEY: str(),
	BAGS_TEST_TOKEN_LAUNCH_IMAGE_BASE64: str(),
	BAGS_TEST_TOKEN_LAUNCH_NAME: str(),
	BAGS_TEST_TOKEN_LAUNCH_SYMBOL: str(),
	BAGS_TEST_TOKEN_LAUNCH_DESCRIPTION: str(),
	BAGS_TEST_TOKEN_LAUNCH_WEBSITE: str(),
	BAGS_TEST_TOKEN_LAUNCH_TELEGRAM: str({default: ''}),
	BAGS_TEST_TOKEN_LAUNCH_TWITTER: str({ default: '' }),
	BAGS_TEST_TRADE_TOKEN_MINT_FROM_TOKEN_MINT: str(),
	BAGS_TEST_TRADE_TOKEN_MINT_TO_TOKEN_MINT: str(),
});

function toPublicKey(name: string, value: string): PublicKey {
	try {
		return new PublicKey(value);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid ${name} value for Bags SDK tests: ${value}. ${message}`);
	}
}

export const testEnv = {
	solanaRpcUrl: rawTestEnv.SOLANA_RPC_URL,
	bagsApiKey: rawTestEnv.BAGS_API_KEY,
	
	// This should be a valid bags token mint
	tokenMint: toPublicKey('BAGS_TEST_TOKEN_MINT', rawTestEnv.BAGS_TEST_TOKEN_MINT),

	// This will most likely be wSOL
	quoteMint: toPublicKey('BAGS_TEST_QUOTE_MINT', rawTestEnv.BAGS_TEST_QUOTE_MINT),
	
	// This should be a valid twitter username
	socialUsername: rawTestEnv.BAGS_TEST_SOCIAL_USERNAME,
	
	// This should be a wallet that has at least one claimable position
	feeWallet: toPublicKey('BAGS_TEST_FEE_WALLET', rawTestEnv.BAGS_TEST_FEE_WALLET),
	
	// This should be a public key that is funded and able to pay for token launches
	launchWallet: toPublicKey('BAGS_TEST_LAUNCH_WALLET', rawTestEnv.BAGS_TEST_LAUNCH_WALLET),

	// This should be a partner wallet for which we expect a config account
	partnerKey: toPublicKey('BAGS_TEST_PARTNER_KEY', rawTestEnv.BAGS_TEST_PARTNER_KEY),

	// This should be a valid bags token config key
	configKey: toPublicKey('BAGS_TEST_CONFIG_KEY', rawTestEnv.BAGS_TEST_CONFIG_KEY),

	tokenLaunchImageBase64: rawTestEnv.BAGS_TEST_TOKEN_LAUNCH_IMAGE_BASE64,
	tokenLaunchName: rawTestEnv.BAGS_TEST_TOKEN_LAUNCH_NAME,
	tokenLaunchSymbol: rawTestEnv.BAGS_TEST_TOKEN_LAUNCH_SYMBOL,
	tokenLaunchDescription: rawTestEnv.BAGS_TEST_TOKEN_LAUNCH_DESCRIPTION,
	tokenLaunchWebsite: rawTestEnv.BAGS_TEST_TOKEN_LAUNCH_WEBSITE,
	tokenLaunchTelegram: rawTestEnv.BAGS_TEST_TOKEN_LAUNCH_TELEGRAM,
	tokenLaunchTwitter: rawTestEnv.BAGS_TEST_TOKEN_LAUNCH_TWITTER,

	tradeTokenMintFromTokenMint: toPublicKey('BAGS_TEST_TRADE_TOKEN_MINT_FROM_TOKEN_MINT', rawTestEnv.BAGS_TEST_TRADE_TOKEN_MINT_FROM_TOKEN_MINT),
	tradeTokenMintToTokenMint: toPublicKey('BAGS_TEST_TRADE_TOKEN_MINT_TO_TOKEN_MINT', rawTestEnv.BAGS_TEST_TRADE_TOKEN_MINT_TO_TOKEN_MINT),
};

export type TestEnv = typeof testEnv;
