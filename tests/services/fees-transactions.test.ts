import { afterEach, describe, expect, test, vi } from 'vitest';
import { AddressLookupTableAccount, Connection, Keypair, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { BagsApiClient } from '../../src/api/bags-client';
import { FeesService } from '../../src/services/fees';
import { signAndSendTransaction } from '../../src/utils/helpers';

const sponsor = Keypair.generate();
const user = Keypair.generate();
const tokenMint = Keypair.generate().publicKey;
const recipient = Keypair.generate().publicKey;
const blockhash = { blockhash: Keypair.generate().publicKey.toBase58(), lastValidBlockHeight: 123 };
const lookupTable = new AddressLookupTableAccount({
	key: Keypair.generate().publicKey,
	state: {
		deactivationSlot: BigInt('18446744073709551615'),
		lastExtendedSlot: 0,
		lastExtendedSlotStartIndex: 0,
		addresses: [recipient],
	},
});

function createClaim(version: 'legacy' | 0) {
	const instruction = SystemProgram.transfer({ fromPubkey: user.publicKey, toPubkey: recipient, lamports: 1 });
	if (version === 'legacy') {
		const transaction = new Transaction({ feePayer: sponsor.publicKey, recentBlockhash: blockhash.blockhash }).add(instruction);
		transaction.partialSign(sponsor);
		const tx = bs58.encode(transaction.serialize({ requireAllSignatures: false }));
		transaction.partialSign(user);
		return { tx, blockhash, fullySigned: transaction.serialize() };
	}

	const transaction = new VersionedTransaction(
		new TransactionMessage({ payerKey: sponsor.publicKey, recentBlockhash: blockhash.blockhash, instructions: [instruction] }).compileToV0Message([lookupTable])
	);
	transaction.sign([sponsor]);
	const tx = bs58.encode(transaction.serialize());
	transaction.sign([user]);
	return { tx, blockhash, fullySigned: transaction.serialize() };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('FeesService transaction decoding', () => {
	test.each([{ versions: ['legacy'] as const }, { versions: [0] as const }, { versions: ['legacy', 0] as const }])(
		'preserves $versions messages and sponsor signatures through the SDK sender',
		async ({ versions }) => {
			const claims = versions.map(createClaim);
			const post = vi.spyOn(BagsApiClient.prototype, 'post').mockResolvedValue(claims.map(({ tx, blockhash }) => ({ tx, blockhash })));
			const connection = new Connection('http://127.0.0.1:8899');
			const send = vi.spyOn(connection, 'sendRawTransaction').mockResolvedValue('claim-signature');
			const status = vi.spyOn(connection, 'getSignatureStatus').mockResolvedValue({
				context: { slot: 1 },
				value: { slot: 1, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
			});
			const service = new FeesService('test-api-key', connection);

			const transactions = await service.getClaimTransactions(user.publicKey, tokenMint);

			expect(post).toHaveBeenCalledWith('/token-launch/claim-txs/v3', { feeClaimer: user.publicKey.toBase58(), tokenMint: tokenMint.toBase58() });
			expect(transactions).toHaveLength(claims.length);
			for (const [index, transaction] of transactions.entries()) {
				expect(transaction).toBeInstanceOf(VersionedTransaction);
				expect(transaction.version).toBe(versions[index]);
				expect(bs58.encode(transaction.serialize())).toBe(claims[index].tx);
				if (transaction.version === 0) {
					expect(transaction.message.addressTableLookups).toHaveLength(1);
					expect(transaction.message.addressTableLookups[0].accountKey.equals(lookupTable.key)).toBe(true);
				}

				const signature = await signAndSendTransaction(connection, 'confirmed', transaction, user, blockhash);

				expect(signature).toBe('claim-signature');
				expect(Buffer.from(send.mock.calls[index][0])).toEqual(Buffer.from(claims[index].fullySigned));
				expect(send.mock.calls[index][1]).toEqual({ skipPreflight: true, maxRetries: 0 });
				expect(Buffer.from(transaction.serialize())).toEqual(Buffer.from(claims[index].fullySigned));
				expect(status).toHaveBeenNthCalledWith(index + 1, signature, { searchTransactionHistory: false });
			}
		}
	);

	test('returns an empty transaction list unchanged', async () => {
		vi.spyOn(BagsApiClient.prototype, 'post').mockResolvedValue([]);
		const service = new FeesService('test-api-key', new Connection('http://127.0.0.1:8899'));
		await expect(service.getClaimTransactions(user.publicKey, tokenMint)).resolves.toEqual([]);
	});

	test('rejects malformed transaction bytes', async () => {
		vi.spyOn(BagsApiClient.prototype, 'post').mockResolvedValue([{ tx: bs58.encode(new Uint8Array([0])), blockhash }]);
		const service = new FeesService('test-api-key', new Connection('http://127.0.0.1:8899'));
		await expect(service.getClaimTransactions(user.publicKey, tokenMint)).rejects.toThrow();
	});
});
