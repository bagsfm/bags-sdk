import { BorshAccountsCoder } from '@coral-xyz/anchor';
import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { BAGS_FEE_SHARE_V2_PROGRAM_ID } from '../../constants';
import { DecodedPartnerConfig } from '../../types/fee-share-v2';

const DISCRIMINATOR_LEN = 8;
const PARTNER_CONFIG_SIZE = 120; // INIT_SPACE per on-chain struct

function readU128LE(buf: Buffer, offset: number): bigint {
	const lo = buf.readBigUInt64LE(offset);
	const hi = buf.readBigUInt64LE(offset + 8);
	return lo + (hi << BigInt(64));
}

export function decodePartnerConfigAccount(raw: Buffer, coder: BorshAccountsCoder): DecodedPartnerConfig {
	const disc = coder.accountDiscriminator('PartnerConfig');

	if (raw.length < disc.length) throw new Error('PartnerConfig.disc: InvalidDataLength');

	if (!raw.subarray(0, disc.length).equals(new Uint8Array(disc))) {
		throw new Error('PartnerConfig: AccountDiscriminatorMismatch');
	}

	const afterDisc = raw.subarray(DISCRIMINATOR_LEN);

	if (afterDisc.length < PARTNER_CONFIG_SIZE) {
		throw new Error('PartnerConfig.header: InvalidDataLength');
	}

	const totalClaimedFees = readU128LE(afterDisc, 0);
	const totalAccumulatedFees = afterDisc.readBigUInt64LE(16);
	const totalLifetimeAccumulatedFees = readU128LE(afterDisc, 24);
	const partner = new PublicKey(afterDisc.subarray(40, 72));

	// padding_1: 72..77
	const bump = afterDisc.readUInt8(77);
	const bps = afterDisc.readUInt16LE(78);
	// padding_0: 80..120

	return {
		totalClaimedFees,
		totalAccumulatedFees,
		totalLifetimeAccumulatedFees,
		partner,
		bump,
		bps,
	};
}

export const fetchBagsFeeShareV2PartnerConfig = async (
	address: PublicKey,
	connection: Connection,
	commitment: Commitment = 'processed',
	coder: BorshAccountsCoder
): Promise<DecodedPartnerConfig | null> => {
	const acc = await connection.getAccountInfo(address, commitment);

	if (!acc) {
		return null;
	}

	const raw = acc.data as Buffer;

	return decodePartnerConfigAccount(raw, coder);
};

export function deriveBagsFeeShareV2PartnerConfigPda(partner: PublicKey): PublicKey {
	const [partnerConfig] = PublicKey.findProgramAddressSync([Buffer.from('partner_config'), partner.toBuffer()], new PublicKey(BAGS_FEE_SHARE_V2_PROGRAM_ID));
	return partnerConfig;
}
