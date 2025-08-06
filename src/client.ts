import { Commitment, Connection } from '@solana/web3.js';
import { TokenLaunchService } from './services/token-launch';
import { BagsApiClient } from './api/bags-client';
import { StateService } from './services/state';
import { ConfigService } from './services/config';
import { FeesService } from './services/fees';

export class BagsSDK {
	public bagsApiClient: BagsApiClient;
	public tokenLaunch: TokenLaunchService;
	public state: StateService;
	public config: ConfigService;
	public fee: FeesService;

	constructor(apiKey: string, connection: Connection, commitment: Commitment = 'processed') {
		this.bagsApiClient = new BagsApiClient(apiKey);
		this.tokenLaunch = new TokenLaunchService(apiKey, connection, commitment);
		this.state = new StateService(apiKey, connection, commitment);
		this.config = new ConfigService(apiKey, connection, commitment);
		this.fee = new FeesService(apiKey, connection, commitment);
	}
}
