import { LaunchpadLaunchEvent } from '../generated/restream/src/protos/launchpad_launch_event';
import { MakerActionEvent } from '../generated/restream/src/protos/maker_action_event';
import { DexPriceEvent } from '../generated/restream/src/protos/price_event';
import { DexSwapEvent } from '../generated/restream/src/protos/swap_event';
import type { ReStreamDecoders } from '../types/restream';

export const DEFAULT_RESTREAM_DECODERS: ReStreamDecoders = {
	launchpad_launch: (data) => LaunchpadLaunchEvent.decode(data),
	maker_action: (data) => MakerActionEvent.decode(data),
	price: (data) => DexPriceEvent.decode(data),
	swap: (data) => DexSwapEvent.decode(data),
};
