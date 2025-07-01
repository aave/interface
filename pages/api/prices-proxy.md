# Family Prices Proxy API

This API route provides a server-side proxy for the Family API prices endpoint, allowing client-side code to fetch token prices without exposing the API key.

## Environment Variables

The following environment variable must be set:

```
FAMILY_API_KEY=your_family_api_key_here
```

## Endpoint

`POST /api/family-prices-proxy`

## Request Format

```json
{
  "tokenIds": ["1:0x0000000000000000000000000000000000000000", "137:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"]
}
```

Where `tokenIds` is an array of strings in the format `{chainId}:{tokenAddress}`.

## Response Format

The proxy returns the same response format as the Family API:

```json
{
  "prices": {
    "1:0x0000000000000000000000000000000000000000": {
      "usd": 2807.04,
      "usd_24h_change": null,
      "usd_24h_vol": null
    },
    "137:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
      "usd": 1.00,
      "usd_24h_change": -0.01,
      "usd_24h_vol": 1000000
    }
  }
}
```

## CORS Policy

The proxy implements the same CORS policy as other API routes:
- Allows requests from `https://app.aave.com` and `https://aave.com`
- Allows requests from Vercel deployment URLs matching `*.avaraxyz.vercel.app`
- Can be configured to allow all origins by setting `CORS_DOMAINS_ALLOWED=true`

## Usage

The proxy is used by the `FamilyPricesService` class:

```typescript
const familyService = new FamilyPricesService();

// Get single token price
const price = await familyService.getTokenUsdPrice(1, '0x...');

// Get multiple token prices
const prices = await familyService.getMultipleTokenUsdPrices([
  { chainId: 1, tokenAddress: '0x...' },
  { chainId: 137, tokenAddress: '0x...' }
]);
```

## Error Handling

The proxy handles various error scenarios:
- Missing or invalid API key
- Invalid request format
- Family API errors
- Network errors

All errors are logged server-side and return appropriate HTTP status codes with error messages. 