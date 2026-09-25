import { VersionedTransaction } from '@solana/web3.js';
import { QuoteTransactionPlan, QuoteTransactionPlanWire, QuoteTransactionStage, QuoteTransactionStageWire } from '../types/fee-share-quotes';

function decodeQuoteTransactionStage(stage: QuoteTransactionStageWire): QuoteTransactionStage {
	return {
		id: stage.id,
		kind: stage.kind,
		dependsOn: stage.dependsOn,
		format: stage.format,
		requiredSigners: stage.requiredSigners,
		lifetime: stage.lifetime,
		budget: stage.budget,
		size: stage.size,
		messageSha256: stage.messageSha256,
		transaction: VersionedTransaction.deserialize(Buffer.from(stage.transaction, 'base64')),
	};
}

/**
 * Decodes every stage's base64 transaction in a native quote transaction plan into a
 * `VersionedTransaction`, ready to co-sign and send.
 */
export function decodeQuoteTransactionPlan(plan: QuoteTransactionPlanWire): QuoteTransactionPlan {
	return {
		...plan,
		transactions: plan.transactions.map(decodeQuoteTransactionStage),
	};
}
