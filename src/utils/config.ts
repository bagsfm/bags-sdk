import { Commitment, PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { BAGS_TOKEN_CREATION_AUTHORITY, METEORA_DBC_PROGRAM_ID } from '../constants';
import bs58 from 'bs58';
import BN from 'bn.js';

/**
 * Get the existing config for a wallet.
 *
 * @param wallet The wallet to get the config for
 * @param connection The Solana connection object
 * @param commitment The commitment level
 * @returns The config public key if it exists, otherwise null
 */
export async function getExistingConfig(feeClaimer: PublicKey, connection: Connection, commitment: Commitment): Promise<PublicKey | null> {
	try {
		const accounts = await connection.getProgramAccounts(METEORA_DBC_PROGRAM_ID, {
			filters: [
				{ memcmp: { offset: 40, bytes: feeClaimer.toBase58() } },
				{ memcmp: { offset: 72, bytes: BAGS_TOKEN_CREATION_AUTHORITY.toBase58() } },
				{ memcmp: { offset: 104, bytes: bs58.encode(new BN(20000000).toArray('le', 8)) } },
			],
			commitment: commitment,
		});

		return accounts.length > 0 ? accounts[0].pubkey : null;
	} catch (err) {
		console.error('Error fetching config from RPC:', err);
		return null;
	}
}
