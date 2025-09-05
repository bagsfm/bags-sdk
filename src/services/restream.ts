import {
	DEFAULT_RESTREAM_CLIENT_OPTS,
	DEFAULT_RESTREAM_CONNECT_TIMEOUT_MS,
	DEFAULT_RESTREAM_MAX_SUBS,
	DEFAULT_RESTREAM_MAX_WILDCARD_SUBS,
	DEFAULT_RESTREAM_PING_INTERVAL_MS,
	DEFAULT_RESTREAM_RECONNECT,
	DEFAULT_RESTREAM_URL,
} from '../constants';
import type {
	RestreamChannel,
	ReStreamClientOptions,
	RestreamDecoderFn,
	ReStreamDecoders,
	RestreamPendingSubscribe,
	RestreamReconnectState,
	RestreamSubject,
	RestreamSubscriptionHandler,
	RestreamTopic,
} from '../types/restream';
import WebSocket from 'ws';
import EventEmitter from 'node:events';
import { DEFAULT_RESTREAM_DECODERS } from '../utils/restream-decoders';
import { type LaunchpadLaunchEvent, SupportedLaunchpadEvent, supportedLaunchpadEventToJSON } from '../generated/restream/src/protos/launchpad_launch_event';
import type { DexSwapEvent } from '../generated/restream/src/protos/swap_event';
import type { DexPriceEvent } from '../generated/restream/src/protos/price_event';
import type { MakerActionEvent } from '../generated/restream/src/protos/maker_action_event';
import { PublicKey } from '@solana/web3.js';

/**
 * A full-fledged, highly configurable WebSocket client for Restream that
 * provides real-time streaming of Solana DeFi events including swaps,
 * prices, and launchpad launches.
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Subscription management with wildcard support
 * - Built-in protobuf decoding for structured events
 * - Configurable rate limiting and connection options
 * - Type-safe event handlers with TypeScript generics
 *
 * @example
 * ```typescript
 * const client = new RestreamClient({
 *   endpoint: 'wss://restream.bags.fm'
 * });
 *
 * await client.connect();
 *
 * // Subscribe to swap events
 * const unsubSwaps = client.subscribeTopic(
 *   'swap',
 *   '3HP2Gg5sTaNta2ztzrRCA63btYSeyptASkGLcyQXWfBU',
 *   (swapData, meta) => {
 *     console.log('Swap on', meta.channel, ':', swapData);
 *   }
 * );
 *
 * // Clean up
 * unsubSwaps();
 * await client.disconnect();
 * ```
 */
export class RestreamClient extends EventEmitter {
	private ws: WebSocket | null = null;
	private readonly endpoint: string;
	private readonly apiKey: string;
	private readonly pingIntervalMs: number;
	private readonly maxSubscriptions: number;
	private readonly maxWildcardSubscriptions: number;
	private readonly connectTimeoutMs: number;
	private readonly reconnectCfg = { ...DEFAULT_RESTREAM_RECONNECT };
	private readonly decoders: ReStreamDecoders = DEFAULT_RESTREAM_DECODERS;

	private pingTimer: NodeJS.Timeout | null = null;
	private reconnectTimer: NodeJS.Timeout | null = null;
	private shouldReconnect = true;
	private reconnect: RestreamReconnectState = {
		attempts: 0,
		nextDelayMs: DEFAULT_RESTREAM_RECONNECT.initialDelayMs,
	};

	// Map of channel -> set of handlers
	private handlers: Map<RestreamChannel, Set<RestreamSubscriptionHandler>> = new Map();

	// Tracks what we've asked the server to subscribe to, for re-subscribe on
	// reconnect. The value is a ref-count of handlers per channel.
	private serverSubsRefCount: Map<RestreamChannel, number> = new Map();

	// Queue subscribe requests if socket isn't open yet
	private pendingSubscribes: RestreamPendingSubscribe[] = [];

	constructor(opts: ReStreamClientOptions = DEFAULT_RESTREAM_CLIENT_OPTS) {
		super();

		// Prevent unhandled 'error' events from crashing the process
		this.on('error', () => {});

		this.apiKey = opts.apiKey;
		this.endpoint = opts.endpoint ?? DEFAULT_RESTREAM_URL;
		this.pingIntervalMs = opts.pingIntervalMs ?? DEFAULT_RESTREAM_PING_INTERVAL_MS;
		this.maxSubscriptions = opts.maxSubscriptions ?? DEFAULT_RESTREAM_MAX_SUBS;
		this.maxWildcardSubscriptions = opts.maxWildcardSubscriptions ?? DEFAULT_RESTREAM_MAX_WILDCARD_SUBS;
		this.connectTimeoutMs = opts.connectTimeoutMs ?? DEFAULT_RESTREAM_CONNECT_TIMEOUT_MS;

		if (opts.reconnect) {
			Object.assign(this.reconnectCfg, opts.reconnect);
		}

		if (opts.decoders) {
			Object.assign(this.decoders, opts.decoders);
		}
	}

	/**
	 * Connect to the Restream endpoint. If already connected, does nothing.
	 * If the connection drops, it will auto-reconnect based on the configured
	 * strategy.
	 *
	 * - Emits `open` event on successful connection.
	 * - Emits `close` event on disconnection with `{ code, reason }`.
	 * - Emits `error` event on connection or protocol errors.
	 *
	 * The call will time out and reject if the connection is not established
	 * within `connectTimeoutMs`.
	 *
	 * @returns Promise that resolves when connected.
	 * @throws If connection fails or times out.
	 *
	 * @example
	 * const client = new RestreamClient();
	 * await client.connect();
	 * client.on('open', () => {
	 *   console.log('Connected to RestreamClient');
	 * });
	 */
	public async connect(): Promise<void> {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

		this.shouldReconnect = true;
		const url = this.buildUrl();
		const timeout = this.connectTimeoutMs;

		return new Promise<void>((resolve, reject) => {
			const ws = new WebSocket(url);

			let settled = false;
			const timer = setTimeout(() => {
				onErrorOnce(new Error(`WebSocket connect timeout after ${timeout}ms`));
			}, timeout);

			const onOpenOnce = () => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				ws.removeListener('error', onErrorOnce);

				this.ws = ws;
				this.attachPersistentListeners(ws);
				this.onOpen();
				resolve();
			};

			const onErrorOnce = (err: Error) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				ws.removeListener('open', onOpenOnce);

				try {
					ws.terminate();
				} catch {
					// ignore
				}
				this.ws = null;
				reject(err);
			};

			ws.once('open', onOpenOnce);
			ws.once('error', onErrorOnce);
		});
	}

	/**
	 * Disconnect from the Restream endpoint. If not connected, does nothing.
	 * Stops any auto-reconnect attempts.
	 *
	 * - Emits `close` event on disconnection with `{ code, reason }`.
	 *
	 * @param code - WebSocket close code, default 1000 (normal closure)
	 * @param reason - Close reason, default 'client closing'
	 * @returns Promise that resolves when fully disconnected.
	 *
	 * @example
	 * const client = new RestreamClient();
	 * await client.connect();
	 * // ... use the client ...
	 * await client.disconnect(1000, 'Shutting down');
	 * console.log('Disconnected from RestreamClient');
	 */
	public async disconnect(code = 1000, reason = 'client closing'): Promise<void> {
		this.shouldReconnect = false;
		this.stopPing();

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		const ws = this.ws;
		if (!ws) return;

		return new Promise<void>((resolve) => {
			if (ws.readyState === WebSocket.CLOSED) {
				this.ws = null;
				return resolve();
			}

			ws.once('close', () => {
				this.ws = null;
				resolve();
			});

			try {
				ws.close(code, reason);
			} catch {
				this.ws = null;
				resolve();
			}
		});
	}

	/**
	 * Subscribe to a topic and subject with a handler.
	 * The subject can be a specific value or '*' for wildcard.
	 * Returns an unsubscribe function to remove the handler.
	 *
	 * Enforces subscription limits:
	 * - Max total distinct channels (topic:subject)
	 * - Max wildcard subscriptions (topic:*)
	 *
	 * @template T The expected type of the decoded message payload. Check protos
	 * for more details.
	 * @param topic - The topic to subscribe to (e.g. 'swap', 'price')
	 * @param subject - The subject to subscribe to (e.g. token address or '*')
	 * @param handler - Callback invoked with decoded message and metadata
	 * @returns Function to unsubscribe the handler
	 *
	 * @example
	 * const client = new RestreamClient();
	 * await client.connect();
	 * const unsubscribe = client.subscribeTopic(
	 *   'price',
	 *   '*',
	 *   (data, meta) => {
	 *     console.log('Price update:', data, 'on channel:', meta.channel);
	 *   },
	 * );
	 *
	 * // Later, to unsubscribe:
	 * unsubscribe();
	 */
	public subscribeTopic<T = unknown>(topic: RestreamTopic, subject: RestreamSubject, handler: RestreamSubscriptionHandler<T>): () => void {
		const channel = `${topic}:${subject}`;
		return this.subscribe(channel, handler);
	}

	/**
	 * Subscribe to launchpad launch events.
	 *
	 * Returns an unsubscribe function to remove the handler.
	 *
	 * @param launchpad - The launchpad to subscribe to (e.g. 'BAGS')
	 * @param handler - Callback invoked with decoded message and metadata
	 * @returns Function to unsubscribe the handler
	 */
	public subscribeLaunchpadLaunch<T = LaunchpadLaunchEvent>(launchpad: SupportedLaunchpadEvent = SupportedLaunchpadEvent.BAGS, handler: RestreamSubscriptionHandler<T>): () => void {
		const subject = supportedLaunchpadEventToJSON(launchpad);
		const channel = `launchpad_launch:${subject}`;
		return this.subscribe(channel, handler);
	}

	/**
	 * Subscribe to **BAGS** launch events.
	 *
	 * Returns an unsubscribe function to remove the handler.
	 * @param handler - Callback invoked with decoded message and metadata
	 */
	public subscribeBagsLaunches(handler: RestreamSubscriptionHandler<LaunchpadLaunchEvent>): () => void {
		return this.subscribeLaunchpadLaunch(SupportedLaunchpadEvent.BAGS, handler);
	}

	/**
	 * Subscribe to swap events for a specific token address.
	 * Returns an unsubscribe function to remove the handler.
	 *
	 * @param tokenAddress - The base58 token address to subscribe to
	 * @param handler - Callback invoked with decoded message and metadata
	 * @returns Function to unsubscribe the handler
	 */
	public subscribeTokenSwaps<T = DexSwapEvent>(tokenAddress: string | PublicKey, handler: RestreamSubscriptionHandler<T>): (() => void) | null {
		try {
			const address = new PublicKey(tokenAddress);
			const channel = `swap:${address.toBase58()}`;
			return this.subscribe(channel, handler);
		} catch {
			return null;
		}
	}

	/**
	 * Subscribe to price events for a specific token address.
	 * Returns an unsubscribe function to remove the handler.
	 *
	 * **NOTE**: Doesn't support wildcard subscriptions.
	 *
	 * @param tokenAddress - The base58 token address to subscribe to (can be PublicKey)
	 * @param handler - Callback invoked with decoded message and metadata
	 * @returns Function to unsubscribe the handler
	 */
	public subscribeTokenPrice<T = DexPriceEvent>(tokenAddress: string, handler: RestreamSubscriptionHandler<T>): (() => void) | null {
		try {
			const address = new PublicKey(tokenAddress);
			const channel = `price:${address.toBase58()}`;
			return this.subscribe(channel, handler);
		} catch {
			return null;
		}
	}

	/**
	 * Subscribe to swap events for a specific trader address.
	 *
	 * **NOTE**: Doesn't support wildcard subscriptions.
	 *
	 * @param makerAddress - The base58 trader address to subscribe to (can be PublicKey)
	 * @param handler - Callback invoked with decoded message and metadata
	 * @returns Function to unsubscribe the handler
	 */
	public subscribeMakerActions<T = MakerActionEvent>(makerAddress: string, handler: RestreamSubscriptionHandler<T>): (() => void) | null {
		try {
			const address = new PublicKey(makerAddress);
			const channel = `maker_action:${address.toBase58()}`;
			return this.subscribe(channel, handler);
		} catch {
			return null;
		}
	}

	/**
	 * Subscribe to a full channel string with a handler.
	 * The channel can include a specific subject or '*' for wildcard.
	 * Returns an unsubscribe function to remove the handler.
	 *
	 * Enforces subscription limits:
	 * - Max total distinct channels (topic:subject)
	 * - Max wildcard subscriptions (topic:*)
	 *
	 * @template T The expected type of the decoded message payload. Check protos
	 * for more details.
	 * @param channel - The full channel string (e.g. 'price:mytoken')
	 * @param handler - Callback invoked with decoded message and metadata
	 * @returns Function to unsubscribe the handler
	 */
	public subscribe<T = unknown>(channel: RestreamChannel, handler: RestreamSubscriptionHandler<T>): () => void {
		// Enforce subscription limits client side
		this.assertSubscriptionLimits(channel);

		// Register locally
		const set = this.handlers.get(channel) ?? new Set();
		set.add(handler as RestreamSubscriptionHandler);
		this.handlers.set(channel, set);

		// Send subscribe if first handler for this channel
		if ((this.serverSubsRefCount.get(channel) ?? 0) === 0) {
			this.enqueueSubscribe(channel);
			this.flushPendingSubscribes();
		}
		this.serverSubsRefCount.set(channel, (this.serverSubsRefCount.get(channel) ?? 0) + 1);

		// Return unsubscribe function
		return () => {
			const current = this.handlers.get(channel);
			if (!current) return;

			current.delete(handler as RestreamSubscriptionHandler);
			if (current.size === 0) {
				this.handlers.delete(channel);
				// If no local handlers remain, unsubscribe server-side
				const count = (this.serverSubsRefCount.get(channel) ?? 1) - 1;
				if (count <= 0) {
					this.serverSubsRefCount.delete(channel);
					this.sendUnsubscribe(channel);
				} else {
					this.serverSubsRefCount.set(channel, count);
				}
			} else {
				// Decrement ref count only
				const count = (this.serverSubsRefCount.get(channel) ?? 1) - 1;
				this.serverSubsRefCount.set(channel, Math.max(0, count));
			}
		};
	}

	/**
	 * Register a decoder function for a specific topic.
	 *
	 * The decoder will be used to decode incoming messages for that topic.
	 *
	 * If no decoder is registered for a topic, raw binary payloads will be
	 * passed to handlers.
	 *
	 * Only use this if you know what you're doing. Decoders should be
	 * synchronous and performant to avoid blocking the message handling loop.
	 */
	public registerDecoder(topic: RestreamTopic, decoder: RestreamDecoderFn): void {
		this.decoders[topic] = decoder;
	}

	/** --- Internals --- **/

	private attachPersistentListeners(ws: WebSocket): void {
		ws.on('message', (data) => this.onMessage(data));
		ws.on('close', (code, reason) => this.onClose(code, Buffer.from(reason)));
		ws.on('error', (err) => this.onSocketError(err));
	}

	/**
	 * Build the full WebSocket URL with API key if provided.
	 */
	private buildUrl(): string {
		if (!this.apiKey) return this.endpoint;

		const sep = this.endpoint.includes('?') ? '&' : '?';
		return `${this.endpoint}${sep}apiKey=${encodeURIComponent(this.apiKey)}`;
		// Example: wss://restream.bags.fm?apiKey=YOUR_API_KEY
	}

	/**
	 * 'ws' open event.
	 * Emits 'open' event, resets reconnect state, starts pings, flushes pending
	 * subscribes, and re-subscribes existing channels.
	 */
	private onOpen(): void {
		this.emit('open');
		this.resetReconnect();
		this.startPing();
		this.flushPendingSubscribes();
		this.resubscribeAll();
	}

	/**
	 * 'ws' close event
	 *
	 * Emits 'close' event with { code, reason }, stops pings, and if
	 * shouldReconnect is true, schedules a reconnect attempt based on the
	 * configured strategy.
	 */
	private onClose(code: number, reason: Buffer): void {
		this.emit('close', { code, reason: reason.toString() });
		this.stopPing();
		this.ws = null;

		if (this.shouldReconnect && this.reconnectCfg.enabled) {
			this.scheduleReconnect();
		}
	}

	/**
	 * 'ws' error event (persistent)
	 * Emits a non-fatal 'socket_error' for observation.
	 */
	private onSocketError(err: Error): void {
		this.emit('socket_error', err);
	}

	/**
	 * 'ws' message event
	 * Handles both text and binary messages.
	 *
	 * Binary messages are expected to have the format:
	 *   "topic:subject;" + varint_len + protobuf_payload
	 *
	 * Decoding and processing failures are silenced (message is dropped).
	 */
	private onMessage(data: WebSocket.Data): void {
		try {
			if (typeof data === 'string') {
				this.handleTextMessage(data);
				return;
			}

			// 'ws' binary data can be Buffer | ArrayBuffer | Buffer[]
			const buf = this.toBuffer(data);

			// Prefix format: "topic:subject;" then varint_len + protobuf_payload
			const sep = buf.indexOf(';'.charCodeAt(0));
			if (sep < 0) return; // Drop frame

			const channel = buf.subarray(0, sep).toString('utf8');
			const rest = buf.subarray(sep + 1); // varint_len + protobuf

			// Read varint length prefix (silent on errors)
			let bodyLen = 0;
			let bytesRead = 0;
			try {
				({ value: bodyLen, bytesRead } = this.readUVarint(rest));
			} catch (error: unknown) {
				this.logError('Varint read error', { channel, error });
				return; // Drop frame on varint parse error
			}
			if (bodyLen < 0 || bytesRead + bodyLen > rest.length) {
				this.logError('Invalid body length', { channel, bodyLen, bytesRead, restLen: rest.length });
				return; // Drop frame on length inconsistency
			}
			const payload = rest.subarray(bytesRead, bytesRead + bodyLen);

			const { topic, subject } = this.parseChannel(channel);
			const decoder = this.decoders[topic];

			// If we have a decoder for this topic, decode; otherwise pass raw.
			let decoded: unknown;
			if (decoder) {
				try {
					decoded = decoder(payload);
				} catch (error: unknown) {
					this.logError('Decoder error', { topic, subject, channel, error });
					return; // Decoder failure: drop the message silently
				}
			} else {
				decoded = payload;
			}

			// Deliver to exact channel handlers
			const delivered = new Set<RestreamSubscriptionHandler>();
			const exact = this.handlers.get(channel);
			if (exact) {
				for (const handler of exact) {
					delivered.add(handler);
					try {
						handler(decoded, { topic, subject, channel });
					} catch (e) {
						// Surface handler errors (user code)
						this.logError('Handler error', { topic, subject, channel, error: e });
						this.emit('handler_error', e);
					}
				}
			}

			// Deliver to wildcard handlers like "topic:*"
			const wildcardKey = `${topic}:*`;
			if (wildcardKey !== channel) {
				const wild = this.handlers.get(wildcardKey);
				if (wild) {
					for (const handler of wild) {
						if (delivered.has(handler)) continue;
						try {
							handler(decoded, { topic, subject, channel });
						} catch (error: unknown) {
							this.logError('Handler error', { topic, subject, channel, wildcard: true, error });
							this.emit('handler_error', error);
						}
					}
				}
			}

			// Emit a generic event for observability
			this.emit('message', {
				channel,
				topic,
				subject,
				payload,
				decoded,
			});
		} catch (error: unknown) {
			this.logError('Fatal onMessage error', { error });
			// Fully silent on other processing failures
		}
	}

	/**
	 * Handle incoming text messages, expected to be JSON control messages.
	 * Recognizes 'pong' messages and emits 'pong' event.
	 * Emits 'control' event for other JSON messages (e.g. server notices,
	 * errors). Ignores non-JSON text frames.
	 */
	private handleTextMessage(text: string): void {
		// Expect JSON for control messages like pong or errors
		try {
			const msg = JSON.parse(text);
			if (msg?.type === 'pong') {
				this.emit('pong');
				return;
			}
			// Could be server notices, errors, etc.
			this.emit('control', msg);
		} catch {
			// Ignore non-JSON text frames
		}
	}

	/**
	 * Start periodic ping messages to keep the connection alive and detect drops.
	 * Sends a ping every `pingIntervalMs`.
	 * Emits 'ping' event on each ping sent.
	 * If sending fails, emits 'error' event.
	 */
	private startPing(): void {
		this.stopPing();
		this.pingTimer = setInterval(() => {
			if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
			try {
				this.ws.send(JSON.stringify({ type: 'ping' }));
				this.emit('ping');
			} catch (error: unknown) {
				this.logError('Subscribe send error', { error });
			}
		}, this.pingIntervalMs);
	}

	private stopPing(): void {
		if (this.pingTimer) {
			clearInterval(this.pingTimer);
			this.pingTimer = null;
		}
	}

	private resetReconnect(): void {
		this.reconnect.attempts = 0;
		this.reconnect.nextDelayMs = this.reconnectCfg.initialDelayMs;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) return; // Already scheduled

		const { maxDelayMs, factor, jitter } = this.reconnectCfg;
		const base = Math.min(this.reconnect.nextDelayMs, maxDelayMs);
		const jitterAmt = base * (jitter ?? 0.2) * (Math.random() - 0.5) * 2;
		const delay = Math.max(0, Math.floor(base + jitterAmt));

		this.emit('reconnecting', {
			attempt: this.reconnect.attempts + 1,
			delayMs: delay,
		});

		this.reconnectTimer = setTimeout(async () => {
			this.reconnectTimer = null; // Timer has fired
			this.reconnect.attempts += 1;
			this.reconnect.nextDelayMs = Math.min(Math.floor(this.reconnect.nextDelayMs * (factor ?? 1.8)), maxDelayMs);

			try {
				await this.connect();
				this.emit('reconnected', { attempts: this.reconnect.attempts });
			} catch (error: unknown) {
				this.emit('reconnect_error', error);
				this.scheduleReconnect(); // Try again
			}
		}, delay);
	}

	private enqueueSubscribe(channel: RestreamChannel): void {
		// If socket is open, send immediately, otherwise queue
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.sendSubscribe(channel);
		} else {
			this.pendingSubscribes.push({ channel });
		}
	}

	private flushPendingSubscribes(): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
		if (this.pendingSubscribes.length === 0) return;

		const pend = this.pendingSubscribes.splice(0);
		for (const { channel } of pend) {
			this.sendSubscribe(channel);
		}
	}

	private resubscribeAll(): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

		for (const channel of this.serverSubsRefCount.keys()) {
			this.sendSubscribe(channel);
		}
	}

	private sendSubscribe(channel: RestreamChannel): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
		try {
			this.ws.send(JSON.stringify({ type: 'subscribe', event: channel }));
			this.emit('subscribed', { channel });
		} catch (error) {
			this.logError('Subscribe send error', { channel, error });
		}
	}

	private sendUnsubscribe(channel: RestreamChannel): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
		try {
			this.ws.send(JSON.stringify({ type: 'unsubscribe', event: channel }));
			this.emit('unsubscribed', { channel });
		} catch (error) {
			this.logError('Subscribe send error', { channel, error });
		}
	}

	private assertSubscriptionLimits(channel: RestreamChannel): void {
		// Limit total distinct channels
		const distinct = this.handlers.size;
		const isNewChannel = !this.handlers.has(channel);
		if (isNewChannel && distinct >= this.maxSubscriptions) {
			throw new Error(`Max subscriptions (${this.maxSubscriptions}) exceeded.`);
		}

		// Limit wildcard subscriptions
		if (this.isWildcard(channel)) {
			const currentWildcard = Array.from(this.handlers.keys()).filter((c) => this.isWildcard(c)).length;
			if (isNewChannel && currentWildcard >= this.maxWildcardSubscriptions) {
				throw new Error(`Max wildcard subscriptions (${this.maxWildcardSubscriptions}) exceeded.`);
			}
		}
	}

	private parseChannel(channel: RestreamChannel): { topic: RestreamTopic | string; subject: RestreamSubject } {
		const idx = channel.indexOf(':');
		if (idx === -1) return { topic: channel, subject: '' };
		return { topic: channel.slice(0, idx), subject: channel.slice(idx + 1) };
	}

	private isWildcard(channel: RestreamChannel): boolean {
		return channel.endsWith(':*');
	}

	// Unsigned varint (sufficient for typical protobuf message sizes)
	private readUVarint(buf: Uint8Array, offset = 0): { value: number; bytesRead: number } {
		let x = 0;
		let s = 0;
		for (let i = 0; i < 10; i++) {
			const b = buf[offset + i];
			if (b === undefined) throw new Error('Truncated varint.');
			if (b < 0x80) {
				if (i === 9 && b > 1) throw new Error('Varint overflow.');
				return { value: x | (b << s), bytesRead: i + 1 };
			}
			x |= (b & 0x7f) << s;
			s += 7;
		}
		throw new Error('Varint too long.');
	}

	private toBuffer(data: WebSocket.Data): Buffer {
		if (Buffer.isBuffer(data)) return data;
		if (Array.isArray(data)) return Buffer.concat(data);
		if (data instanceof ArrayBuffer) return Buffer.from(data);
		// Fallback (handles ArrayBufferView as well)
		return Buffer.from(data);
	}

	// We'll just emit an event for observability.
	private logError(message: string, context: Record<string, unknown>): void {
		this.emit('client_error', {
			message,
			context,
			timestamp: new Date().toISOString(),
		});
	}
}
