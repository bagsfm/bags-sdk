# @bagsfm/bags-sdk

[![npm version](https://badge.fury.io/js/@bagsfm%2Fbags-sdk.svg)](https://badge.fury.io/js/@bagsfm%2Fbags-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@bagsfm/bags-sdk.svg)](https://www.npmjs.com/package/@bagsfm/bags-sdk)
[![license](https://img.shields.io/npm/l/@bagsfm/bags-sdk.svg)](https://github.com/bagsfm/bags-public-api-sdk/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?logo=solana&logoColor=white)](https://solana.com/)

A TypeScript SDK for interacting with the Bags Public API - Solana token launch and management platform.

## Installation

```bash
npm install @bagsfm/bags-sdk
```

## Usage

```typescript
import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

// Initialize the SDK
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=your-helius-api-key'); // Or any other RPC provider
const sdk = new BagsSDK('your-bags-api-key', connection, 'processed');

// Use the SDK services
const tokenMint = new PublicKey('your-token-mint-address');
const creators = await sdk.state.getTokenCreators(tokenMint);
console.log('Token creators:', creators);
```

## API Reference

### BagsSDK

The main SDK class that provides access to all services:

- `bagsApiClient`: HTTP API client for Bags services
- `tokenLaunch`: Token launch management service
- `state`: State management service  
- `config`: Configuration service
- `fee`: Fee management service

### Constructor

```typescript
new BagsSDK(apiKey: string, connection: Connection, commitment?: Commitment)
```

**Parameters:**
- `apiKey`: Your Bags API key
- `connection`: Solana web3.js Connection instance
- `commitment`: (optional) Transaction commitment level (default: 'processed')

## Requirements

- Node.js >= 18.0.0
- A Bags API key (get one at [https://dev.bags.fm](https://dev.bags.fm))
- A Solana RPC provider (we recommend [Helius](https://helius.dev) - they offer a free tier)

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## License

MIT

## Support

For issues and questions, please visit our [GitHub Issues](https://github.com/bagsfm/bags-public-api-sdk/issues).
