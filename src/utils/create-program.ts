import { AnchorProvider, BorshAccountsCoder, Program, Wallet } from '@coral-xyz/anchor';
import { Commitment, Connection } from '@solana/web3.js';
import DynamicBondingCurveIDL from '../idl/dynamic-bonding-curve/idl.json';
import DammV2IDL from '../idl/damm-v2/idl.json';
import type { DammV2 } from '../idl/damm-v2/idl';
import type { BagsMeteoraFeeClaimer } from '../idl/bags-meteora-fee-claimer/idl';
import type { BagsFeeShare } from '../idl/fee-share-v2/idl';
import type { DynamicBondingCurve } from '../idl/dynamic-bonding-curve/idl';
import BagsMeteoraFeeClaimerIDL from '../idl/bags-meteora-fee-claimer/idl.json';
import BagsFeeShareIDL from '../idl/fee-share-v2/idl.json';

/**
 * Create a DBC program instance
 * @param connection - The connection to the network
 * @returns The program instance
 */
export function createDbcProgram(connection: Connection, commitment: Commitment = 'processed') {
	const provider = new AnchorProvider(connection, null as unknown as Wallet, {
		commitment,
	});

	const program = new Program<DynamicBondingCurve>(DynamicBondingCurveIDL, provider);

	return { program };
}

/**
 * Create a DAMMV2 program instance
 * @param connection - The connection to the network
 * @returns The program instance
 */
export function createDammV2Program(connection: Connection, commitment: Commitment = 'processed') {
	const provider = new AnchorProvider(connection, null as unknown as Wallet, {
		commitment,
	});

	const program = new Program<DammV2>(DammV2IDL, provider);

	return { program };
}

/**
 * Create a BagsMeteoraFeeClaimer program instance
 * @param connection - The connection to the network
 * @returns The program instance
 */
export function createBagsMeteoraFeeClaimerProgram(connection: Connection, commitment: Commitment = 'processed') {
	const provider = new AnchorProvider(connection, null as unknown as Wallet, {
		commitment,
	});

	const program = new Program<BagsMeteoraFeeClaimer>(BagsMeteoraFeeClaimerIDL, provider);

	return { program };
}

/**
 * Create a BagsFeeShareV2 program instance
 * @param connection - The connection to the network
 * @returns The program instance
 */
export function createBagsFeeShareV2Program(connection: Connection, commitment: Commitment = 'processed') {
	const provider = new AnchorProvider(connection, null as unknown as Wallet, {
		commitment,
	});

	const program = new Program<BagsFeeShare>(BagsFeeShareIDL, provider);

	return { program };
}

/**
 * Create a BagsFeeShareV2 coder instance
 * @returns The coder instance
 */
export function createBagsFeeShareV2Coder() {
	return new BorshAccountsCoder(BagsFeeShareIDL as BagsFeeShare);
}
