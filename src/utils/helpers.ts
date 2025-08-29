import { PublicKey } from "@solana/web3.js";

export function maxKey(left: PublicKey, right: PublicKey): Uint8Array {
    const leftBytes = left.toBytes();
    const rightBytes = right.toBytes();

    for (let i = 0; i < 32; i++) {
        if (leftBytes[i] > rightBytes[i]) {
            return leftBytes;
        } else if (leftBytes[i] < rightBytes[i]) {
            return rightBytes;
        }
    }

    return leftBytes;
}

export function minKey(left: PublicKey, right: PublicKey): Uint8Array {
    const leftBytes = left.toBytes();
    const rightBytes = right.toBytes();

    for (let i = 0; i < 32; i++) {
        if (leftBytes[i] < rightBytes[i]) {
            return leftBytes;
        } else if (leftBytes[i] > rightBytes[i]) {
            return rightBytes;
        }
    }

    return leftBytes;
}

export function deriveDbcVirtualPool(configKey: PublicKey, baseMint: PublicKey, quoteMint: PublicKey, programId: PublicKey): PublicKey {
    const seeds = [Buffer.from('pool'), configKey.toBuffer(), maxKey(baseMint, quoteMint), minKey(baseMint, quoteMint)];

    const publicKey = PublicKey.findProgramAddressSync(seeds, programId)[0];

    return publicKey;
}
