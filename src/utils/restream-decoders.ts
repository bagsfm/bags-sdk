import { LaunchpadLaunchEvent } from '../generated/restream/src/protos/launchpad_launch_event';
import type { ReStreamDecoders } from '../types/restream';

export const DEFAULT_RESTREAM_DECODERS: ReStreamDecoders = {
	launchpad_launch: (data) => LaunchpadLaunchEvent.decode(data),
};
