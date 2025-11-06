import { TokenInfo } from 'src/ui-config/TokenList';

/**
 * Token classification used by the swap UI.
 * - NATIVE: chain native asset (e.g. ETH, MATIC)
 * - ERC20: standard ERC-20 token
 * - USER_CUSTOM: user-provided custom token (not on curated list)
 * - COLLATERAL / DEBT: protocol representations used in position-aware flows
 */
export enum TokenType {
  NATIVE,
  ERC20,
  USER_CUSTOM,
  COLLATERAL,
  DEBT,
}

/**
 * Minimal token shape used by the swap module.
 * Notes:
 * - addressToSwap is the address that providers expect for on-chain execution
 * - addressForUsdPrice enables price feeds to diverge from the swap address
 * - underlyingAddress is useful when swapping aTokens or debt tokens
 */
export type SwappableToken = {
  addressToSwap: string;
  addressForUsdPrice: string;
  underlyingAddress: string;
  decimals: number;
  symbol: string;
  name: string;
  balance: string;
  chainId: number;
  usdPrice?: string;
  tokenType?: TokenType;
  logoURI?: string;
};

export const swappableTokenToTokenInfo = (token: SwappableToken): TokenInfo => {
  return {
    address: token.addressToSwap,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId: token.chainId,
    name: token.name,
    logoURI: token.logoURI,
    ...(token.tokenType === TokenType.NATIVE && { extensions: { isNative: true } }),
  };
};
