import DynamicBondingCurveIDL from './idl/dynamic-bonding-curve/idl.json';
import DammV2IDL from './idl/damm-v2/idl.json';
import BagsMeteoraFeeClaimerIDL from './idl/bags-meteora-fee-claimer/idl.json';
import BagsFeeShareIDL from './idl/fee-share-v2/idl.json';
import { PublicKey } from '@solana/web3.js';
import type { BagsMeteoraFeeClaimer } from './idl/bags-meteora-fee-claimer/idl';
import type { BagsFeeShare } from './idl/fee-share-v2/idl';
import type { DynamicBondingCurve } from './idl/dynamic-bonding-curve/idl';
import type { DammV2 } from './idl/damm-v2/idl';

export const BAGS_PUBLIC_API_V2_DEFAULT_BASE_URL = 'https://public-api-v2.bags.fm/api/v1';
export const BAGS_TOKEN_CREATION_AUTHORITY = new PublicKey('BAGSB9TpGrZxQbEsrEznv5jXXdwyP6AXerN8aVRiAmcv');

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const METEORA_DBC_MIGRATION_DAMM_V2_CREATOR = new PublicKey('FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM');
export const BAGS_METEORA_FEE_CLAIMER_VAULT_RENT_EXCEMPT_AMOUNT = 1398960;
export const BAGS_METEORA_FEE_CLAIMER_VAULT_PDA_SEED = 'vault';

export const BAGS_GLOBAL_LUT = new PublicKey('Eq1EVs15EAWww1YtPTtWPzJRLPJoS6VYP9oW9SbNr3yp');
export const BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT = 15;

export const BAGS_FEE_SHARE_V1_PROGRAM_ID = BagsMeteoraFeeClaimerIDL.address as BagsMeteoraFeeClaimer['address'];
export const BAGS_FEE_SHARE_V2_PROGRAM_ID = BagsFeeShareIDL.address as BagsFeeShare['address'];
export const METEORA_DBC_PROGRAM_ID = DynamicBondingCurveIDL.address as DynamicBondingCurve['address'];
export const METEORA_DAMM_V2_PROGRAM_ID = DammV2IDL.address as DammV2['address'];

export const JITO_TIP_ACCOUNTS = [
	new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
	new PublicKey('HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'),
	new PublicKey('Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY'),
	new PublicKey('ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49'),
	new PublicKey('DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh'),
	new PublicKey('ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt'),
	new PublicKey('DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL'),
	new PublicKey('3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT'),
];
