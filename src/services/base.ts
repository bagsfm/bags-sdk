import { BorshAccountsCoder, Program } from '@coral-xyz/anchor';
import type { DynamicBondingCurve as DynamicBondingCurveIDL } from '../idl/dynamic-bonding-curve/idl';
import type { DammV2 as DammV2IDL } from '../idl/damm-v2/idl';
import type { BagsMeteoraFeeClaimer as BagsMeteoraFeeClaimerIDL } from '../idl/bags-meteora-fee-claimer/idl';
import { Commitment, Connection } from '@solana/web3.js';
import { createBagsFeeShareV2Coder, createBagsFeeShareV2Program, createBagsMeteoraFeeClaimerProgram, createDammV2Program, createDbcProgram } from '../utils/create-program';
import { BagsApiClient } from '../api/bags-client';
import { StateService } from './state';
import type { BagsFeeShare as BagsFeeShareIDL } from '../idl/fee-share-v2/idl';

export class BaseService {
	protected bagsApiClient: BagsApiClient;
	protected dbcProgram: Program<DynamicBondingCurveIDL>;
	protected dammV2Program: Program<DammV2IDL>;
	protected bagsMeteoraFeeClaimer: Program<BagsMeteoraFeeClaimerIDL>;
	protected bagsFeeShareV2: Program<BagsFeeShareIDL>;
	protected bagsFeeShareV2Coder: BorshAccountsCoder;
	protected connection: Connection;
	protected commitment: Commitment;
	protected stateService: StateService;

	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		this.bagsApiClient = new BagsApiClient(apiKey);
		this.dbcProgram = createDbcProgram(connection, commitment).program;
		this.dammV2Program = createDammV2Program(connection, commitment).program;
		this.bagsMeteoraFeeClaimer = createBagsMeteoraFeeClaimerProgram(connection, commitment).program;
		this.bagsFeeShareV2 = createBagsFeeShareV2Program(connection, commitment).program;
		this.bagsFeeShareV2Coder = createBagsFeeShareV2Coder();
		this.connection = connection;
		this.commitment = commitment;
		this.stateService = new StateService(apiKey, connection, commitment);
	}
}
