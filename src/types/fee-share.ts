import { BlockhashWithExpiryBlockHeight } from '@solana/web3.js';

export type TransactionWithBlockhash = {
	blockhash: BlockhashWithExpiryBlockHeight;
	transaction: string;
};

export type GetOrCreateConfigApiResponse = {
	needsCreation: boolean;
	feeShareAuthority: string;
	meteoraConfigKey?: string;
	transactions?: TransactionWithBlockhash[];
	bundles?: TransactionWithBlockhash[][];
};
