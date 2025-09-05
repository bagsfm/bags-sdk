import type { RESTREAM_KNOWN_EVENTS } from '../constants';
import type { LaunchpadLaunchEvent } from '../generated/restream/src/protos/launchpad_launch_event';
import type { MakerActionEvent } from '../generated/restream/src/protos/maker_action_event';
import type { DexPriceEvent } from '../generated/restream/src/protos/price_event';
import type { DexSwapEvent } from '../generated/restream/src/protos/swap_event';

export type RestreamKnownTopics = (typeof RESTREAM_KNOWN_EVENTS)[number];
export type RestreamChannel = string;
export type RestreamTopic = RestreamKnownTopics;
export type RestreamSubject = string;

export interface ReStreamClientOptions {
	/**
	 * Not required for beta but may add in future
	 */
	apiKey?: string;
	/**
	 * @default wss://restream.bags.fm
	 */
	endpoint?: string;
	/**
	 * How often to send ping messages to keep the connection alive.
	 *
	 * @default 30000
	 */
	pingIntervalMs?: number;
	/**
	 * Max subscription count.
	 *
	 * @default 50 (service limit)
	 */
	maxSubscriptions?: number;
	/**
	 * Max wildcard subscription count. Wildcard subscriptions are those that use `*` as the subject.
	 *
	 * @default: 5 (service limit)
	 */
	maxWildcardSubscriptions?: number;
	/**
	 * Reconnection strategy settings
	 */
	reconnect?: {
		/**
		 * @default true
		 */
		enabled?: boolean;
		/**
		 * Initial delay in milliseconds before the first reconnection attempt.
		 *
		 * @default 250
		 */
		initialDelayMs?: number;
		/**
		 * @default 10_000 (maximum delay between reconnection attempts)
		 */
		maxDelayMs?: number;
		/**
		 * @default 1.8 (exponential backoff factor)
		 */
		factor?: number;
		/**
		 * @default 0.2 (20% jitter)
		 */
		jitter?: number;
	};
	/**
	 * Initial connection timeout (when u call .connect())
	 *
	 * @default 3_000 (3 seconds)
	 */
	connectTimeoutMs?: number; // default: 3_000
	/**
	 * Custom decoders for known and unknown topics.
	 *
	 * If not provided, the client will only be able to decode known topics using default decoders.
	 *
	 * Only edit on this if you know what you're doing!
	 */
	decoders?: ReStreamDecoders;
}

export interface RestreamSubscriptionMeta {
	topic: RestreamTopic | string;
	subject: RestreamSubject;
	channel: RestreamChannel;
}

export type RestreamSubscriptionHandler<T = unknown> = (event: T, meta: RestreamSubscriptionMeta) => void;
export type RestreamSwapSubscriptionHandler = RestreamSubscriptionHandler<DexSwapEvent>;
export type RestreamLaunchpadLaunchSubscriptionHandler = RestreamSubscriptionHandler<LaunchpadLaunchEvent>;
export type RestreamPriceSubscriptionHandler = RestreamSubscriptionHandler<DexPriceEvent>;
export type RestreamMakerActionSubscriptionHandler = RestreamSubscriptionHandler<MakerActionEvent>;

export interface RestreamPendingSubscribe {
	channel: RestreamChannel;
}

export interface RestreamReconnectState {
	attempts: number;
	nextDelayMs: number;
}

export type RestreamDecoderFn = (payload: Uint8Array) => unknown;

export type ReStreamDecoders = Record<RestreamKnownTopics, RestreamDecoderFn> & {
	// Keyed by topic. Example: { launchpad_launch: (bytes) => LaunchpadLaunchEvent.decode(bytes) }
	[topic: string]: RestreamDecoderFn;
};
