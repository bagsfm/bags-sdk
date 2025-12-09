import { PublicKey } from '@solana/web3.js';

export type DecodedPartnerConfig = {
	totalClaimedFees: bigint; // u128
	totalAccumulatedFees: bigint; // u64 as bigint
	totalLifetimeAccumulatedFees: bigint; // u128
	partner: PublicKey;
	bump: number; // u8
	bps: number; // u16
};
