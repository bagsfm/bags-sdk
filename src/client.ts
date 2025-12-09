import { Commitment, Connection } from '@solana/web3.js';
import { TokenLaunchService } from './services/token-launch';
import { BagsApiClient } from './api/bags-client';
import { StateService } from './services/state';
import { ConfigService } from './services/config';
import { FeesService } from './services/fees';
import { PartnerService } from './services/partner';
import { TradeService } from './services/trade';
import { SolanaService } from './services/solana';

export class BagsSDK {
	public bagsApiClient: BagsApiClient;
	public tokenLaunch: TokenLaunchService;
	public state: StateService;
	public config: ConfigService;
	public fee: FeesService;
	public partner: PartnerService;
	public trade: TradeService;
	public solana: SolanaService;

	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		this.bagsApiClient = new BagsApiClient(apiKey);
		this.tokenLaunch = new TokenLaunchService(apiKey, connection, commitment);
		this.state = new StateService(apiKey, connection, commitment);
		this.config = new ConfigService(apiKey, connection, commitment);
		this.fee = new FeesService(apiKey, connection, commitment);
		this.partner = new PartnerService(apiKey, connection, commitment);
		this.trade = new TradeService(apiKey, connection, commitment);
		this.solana = new SolanaService(apiKey, connection, commitment);
	}
}
