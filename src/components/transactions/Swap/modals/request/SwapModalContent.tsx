import { Box, CircularProgress } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useRootStore } from 'src/store/root';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import {
  invalidateAppStateForSwap,
  supportedNetworksWithEnabledMarket,
} from '../../helpers/shared';
import { SwappableToken, SwapParams, SwapType, TokenType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';

export const SwapModalContent = ({
  underlyingAsset,
  chainId: chainIdFromSelection,
}: {
  underlyingAsset?: string;
  chainId?: number;
}) => {
  const queryClient = useQueryClient();
  const [account, chainIdInApp] = useRootStore(
    useShallow((store) => [store.account, store.currentChainId])
  );
  const [chainId, setChainId] = useState(chainIdFromSelection ?? chainIdInApp);
  const initialDefaultTokens = useMemo(() => getFilteredTokensForSwitch(chainId), [chainId]);
  const reserves = useAppDataContext().reserves;

  const {
    data: initialTokens,
    refetch: refetchInitialTokens,
    isFetching: tokensLoading,
  } = useTokensBalance(initialDefaultTokens, chainId, account);

  const swappableTokens = initialTokens
    ?.map((token) => {
      const reserve = reserves.find(
        (reserve) => reserve.underlyingAsset.toLowerCase() === token.address.toLowerCase()
      );
      const wrappedBaseReserve = reserves.find((r) => r.isWrappedBaseAsset);

      return {
        addressToSwap: token.address,
        addressForUsdPrice: token.address,
        underlyingAddress: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        chainId,
        usdPrice:
          reserve?.priceInUSD ??
          (token.extensions?.isNative ? wrappedBaseReserve?.priceInUSD : undefined),
        logoURI: reserve?.iconSymbol
          ? `/icons/tokens/${reserve.iconSymbol.toLowerCase()}.svg`
          : token.logoURI,
        tokenType: token.extensions?.isNative ? TokenType.NATIVE : TokenType.ERC20,
      };
    })
    .filter((token) => token.balance !== '0')
    .sort((a, b) => Number(b.balance) - Number(a.balance));

  const defaultInputToken = getDefaultInputToken(swappableTokens ?? [], underlyingAsset ?? '');
  const defaultOutputToken = getDefaultOutputToken(swappableTokens ?? []);

  const invalidateAppState = () => {
    invalidateAppStateForSwap({
      swapType: SwapType.Swap,
      chainId,
      account,
      queryClient,
    });
  };

  const refreshTokens = (chainId: number) => {
    setChainId(chainId);
    refetchInitialTokens();
  };

  const params: Partial<SwapParams> = {
    swapType: SwapType.Swap,
    allowLimitOrders: true,
    suggestedDefaultInputToken: defaultInputToken,
    suggestedDefaultOutputToken: defaultOutputToken,
    invalidateAppState,
    sourceTokens: swappableTokens ?? [],
    destinationTokens: swappableTokens ?? [],
    chainId,
    refreshTokens,
    supportedNetworks: supportedNetworksWithEnabledMarket,
    showOutputBalance: true,
    outputBalanceTitle: 'Current balance',
  };

  if (tokensLoading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <BaseSwapModalContent params={params} />;
};

export const getFilteredTokensForSwitch = (chainId: number): TokenInfoWithBalance[] => {
  let customTokenList = TOKEN_LIST.tokens;
  const savedCustomTokens = localStorage.getItem('customTokens');
  if (savedCustomTokens) {
    customTokenList = customTokenList.concat(JSON.parse(savedCustomTokens));
  }

  const transformedTokens = customTokenList.map((token) => {
    return { ...token, balance: '0' };
  });
  const realChainId = getNetworkConfig(chainId).underlyingChainId ?? chainId;

  // Remove duplicates
  const seen = new Set<string>();
  return transformedTokens
    .filter((token) => token.chainId === realChainId)
    .filter((token) => {
      const key = `${token.chainId}:${token.address.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

/// Suggested default tokens is user selection or token with highest balance
const getDefaultInputToken = (swappableTokens: SwappableToken[], underlyingAsset: string) => {
  const userSelectedInputToken = swappableTokens.find(
    (token) => token.addressToSwap.toLowerCase() === underlyingAsset?.toLowerCase()
  );

  if (userSelectedInputToken) {
    return userSelectedInputToken;
  }

  const tokensWithBalance = swappableTokens.filter((token) => token.balance !== '0');

  if (tokensWithBalance.length === 0) {
    return swappableTokens[0];
  }

  const tokenWithMaxBalance = tokensWithBalance.sort(
    (a, b) => Number(b.balance) - Number(a.balance)
  )[0];

  return tokenWithMaxBalance;
};

/// Suggested default output token is GHO if available or second token with highest balance
export const getDefaultOutputToken = (
  swappableTokens: SwappableToken[],
  underlyingAsset?: string
) => {
  const GHO = swappableTokens.find((token) => token.symbol === 'GHO');

  const tokenWithSecondMaxBalance = swappableTokens
    .filter((token) => token.underlyingAddress.toLowerCase() !== underlyingAsset?.toLowerCase())
    .sort((a, b) => Number(b.balance) - Number(a.balance))[1];

  return GHO ?? tokenWithSecondMaxBalance;
};
