# @bagsfm/bags-sdk

[![npm version](https://badge.fury.io/js/@bagsfm%2Fbags-sdk.svg)](https://badge.fury.io/js/@bagsfm%2Fbags-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@bagsfm/bags-sdk.svg)](https://www.npmjs.com/package/@bagsfm/bags-sdk)
[![license](https://img.shields.io/npm/l/@bagsfm/bags-sdk.svg)](https://github.com/bagsfm/bags-public-api-sdk/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?logo=solana&logoColor=white)](https://solana.com/)

A TypeScript SDK for interacting with the Bags Public API - Solana token launch and management platform.

For detailed API documentation, guides, and examples, visit [docs.bags.fm](https://docs.bags.fm/).

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

// Query token creators
const tokenMint = new PublicKey('your-token-mint-address');
const creators = await sdk.state.getTokenCreators(tokenMint);
console.log('Token creators:', creators);

// Get a swap quote
const quote = await sdk.trade.getQuote({
  inputMint: 'So11111111111111111111111111111111111111112',
  outputMint: 'your-token-mint-address',
  amount: 1_000_000_000, // 1 SOL in lamports
  slippageMode: 'dynamic',
});
console.log('Swap quote:', quote);

// Claim fees
const claimable = await sdk.fee.getAllClaimablePositions(walletPublicKey);
console.log('Claimable positions:', claimable);
```

## API Reference

### BagsSDK

The main SDK class that provides access to all services.

#### Constructor

```typescript
new BagsSDK(apiKey: string, connection: Connection, commitment?: Commitment)
```

**Parameters:**

- `apiKey`: Your Bags API key
- `connection`: Solana web3.js Connection instance
- `commitment`: (optional) Transaction commitment level (default: `'processed'`)

### Services

| Service | Property | Description |
|---------|----------|-------------|
| **API Client** | `sdk.bagsApiClient` | Low-level HTTP client for direct Bags API calls |
| **Token Launch** | `sdk.tokenLaunch` | Create token launches and upload token metadata |
| **State** | `sdk.state` | Query token creators, lifetime fees, leaderboards, launch wallets, and claim stats |
| **Config** | `sdk.config` | Create and manage fee-share configurations and lookup tables |
| **Fees** | `sdk.fee` | List claimable fee positions and build claim transactions |
| **Partner** | `sdk.partner` | Read/create partner configs and claim partner fees |
| **Trade** | `sdk.trade` | Get swap quotes and build swap transactions |
| **Solana** | `sdk.solana` | Submit Jito bundles, check bundle statuses, and query Jito tip fees |
| **Fee Share Admin** | `sdk.feeShareAdmin` | Transfer admin roles, list admin mints, and update fee-share configs |
| **Dexscreener** | `sdk.dexscreener` | Check order availability, create orders, and submit payments for Dexscreener listings |
| **Incorporation** | `sdk.incorporation` | Start payments, register incorporation details, and manage incorporation projects |
| **Auth** | `sdk.auth` | Fetch the API key owner's user profile |

### Exported Utilities

The SDK also exports helper functions and types you can import directly:

```typescript
import {
  sleep,
  chunkArray,
  signAndSendTransaction,
  sendBundleAndConfirm,
  createTipTransaction,
  serializeVersionedTransaction,
  prepareImageForFormData,
  detectImageInputType,
  sortKeys,
} from '@bagsfm/bags-sdk';
```

### Exported Constants

Common program IDs and addresses are available as named exports:

```typescript
import {
  BAGS_FEE_SHARE_V1_PROGRAM_ID,
  BAGS_FEE_SHARE_V2_PROGRAM_ID,
  METEORA_DBC_PROGRAM_ID,
  METEORA_DAMM_V2_PROGRAM_ID,
  BAGS_GLOBAL_LUT,
  WRAPPED_SOL_MINT,
  JITO_TIP_ACCOUNTS,
} from '@bagsfm/bags-sdk';
```

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

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint source files
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format source files
npm run format

# Check formatting
npm run format:check

# Clean build artifacts
npm run clean
```

## License

MIT

## Support

For issues and questions, please visit our [GitHub Issues](https://github.com/bagsfm/bags-public-api-sdk/issues).
