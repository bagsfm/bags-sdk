import { PublicKey } from '@solana/web3.js';
import { BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED } from '../constants';

export function getFeeVaultPda(feeClaimer: PublicKey, baseMint: PublicKey, programId: PublicKey): PublicKey {
	return PublicKey.findProgramAddressSync([Buffer.from(BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED), feeClaimer.toBuffer(), baseMint.toBuffer()], programId)[0];
}
