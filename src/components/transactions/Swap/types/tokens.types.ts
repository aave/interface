import { TokenInfo } from 'src/ui-config/TokenList';

export enum TokenType {
  NATIVE,
  ERC20,
  USER_CUSTOM,
  COLLATERAL,
  DEBT,
}

export type SwappableToken = {
  addressToSwap: string;
  addressForUsdPrice: string;
  underlyingAddress: string; // Useful in aTokens swaps
  decimals: number;
  symbol: string;
  name: string;
  balance: string;
  chainId: number;
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
