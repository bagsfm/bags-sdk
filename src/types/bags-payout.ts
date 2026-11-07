export type BagsPayoutCashoutMethod = 'xmoney' | 'venmo' | 'cashapp';

export interface BagsPayoutPayment {
	/** The payment's Peer intent hash (`0x` + 64 lowercase hex) */
	id: string;
	/** Id of the payout the payment belongs to (24 hex characters) */
	payoutId: string;
	tokenMint: string;
	tokenName: string | null;
	tokenSymbol: string | null;
	tokenImage: string | null;
	cashoutMethod: BagsPayoutCashoutMethod;
	/** Payout handle as stored on the payout */
	username: string;
	/** `@handle` for X Money; bare name for Venmo and Cash App */
	displayHandle: string;
	/** Verified fiat paid, in USD cents, as string to support bigint */
	fiatPaidCents: string;
	/** USDC amount of the fill, in USDC base units (6 decimals), as string to support bigint */
	amountRaw: string;
	discountBps: number;
	/** ISO timestamp of the payment, or null when unknown */
	paidAt: string | null;
}
