import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Commitment, Connection } from '@solana/web3.js';
import type { DynamicBondingCurve } from '../idl/dynamic-bonding-curve/idl';
import DynamicBondingCurveIDL from '../idl/dynamic-bonding-curve/idl.json';
import type { DammV2 } from '../idl/damm-v2/idl';
import DammV2IDL from '../idl/damm-v2/idl.json';
import type { BagsMeteoraFeeClaimer } from '../idl/bags-meteora-fee-claimer/idl';
import BagsMeteoraFeeClaimerIDL from '../idl/bags-meteora-fee-claimer/idl.json';

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
