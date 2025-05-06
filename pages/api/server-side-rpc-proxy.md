# Server-Side RPC Proxy

This document explains how the server-side RPC proxy works to protect private RPC URLs.

## Overview

Instead of exposing private RPC URLs to the client, we use a server-side proxy that handles all RPC requests. This way, the private RPC URLs are only stored on the server and never exposed to the client.

## Implementation

The implementation consists of two main parts:

1. **API Endpoint** (`pages/api/rpc-proxy.ts`): A Next.js API route that receives RPC requests from the client, forwards them to the appropriate RPC endpoint, and returns the result.

2. **Custom Provider** (`src/utils/ServerJsonRpcProvider.ts`): A custom ethers provider that routes all RPC requests through the API endpoint instead of directly connecting to the RPC URL.

## Configuration

### Environment Variables

Add your private alchemy RPC URLs to your server's environment variables:

```env
MAINNET_RPC_API_KEY=<your-mainnet-rpc-api-key>
POLYGON_RPC_API_KEY=<your-polygon-rpc-api-key>
AVALANCHE_RPC_API_KEY=<your-avalanche-rpc-api-key>
# Add more as needed
```

## Security Considerations

1. **Environment Variables**: Make sure your environment variables are properly secured and not leaked in client-side code.

2. **Rate Limiting**: Consider adding rate limiting to the API endpoint to prevent abuse.

## How it Works

1. When the application needs to make an RPC request, it uses the `getProvider` function in `src/utils/marketsAndNetworksConfig.ts`.

2. If a private RPC URL is configured for the chain, it creates a `ServerJsonRpcProvider` for that chain.

3. When a method is called on the provider, it sends a request to the `/api/rpc-proxy` endpoint with the chain ID, method, and parameters.

4. The API endpoint looks up the private RPC URL for the specified chain, forwards the request, and returns the result.

5. The result is then returned to the caller as if it was fetched directly from the RPC endpoint.

## Adding Support for More Chains

To add support for more chains:

1. Add the environment variable in your server environment (e.g., `ZKSYNC_RPC_API_KEY`).

2. Update the `NETWORK_CONFIG` object in `pages/api/rpc-proxy.ts` to include the new chain and network name.