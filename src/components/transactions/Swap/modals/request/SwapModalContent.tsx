import { Box, CircularProgress } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useRootStore } from 'src/store/root';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { supportedNetworksWithEnabledMarket } from '../../helpers/shared';
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
  const [account, chainIdInApp, currentMarketData] = useRootStore(
    useShallow((store) => [store.account, store.currentChainId, store.currentMarketData])
  );
  const [chainId, setChainId] = useState(chainIdFromSelection ?? chainIdInApp);
  const initialDefaultTokens = useMemo(() => getFilteredTokensForSwitch(chainId), [chainId]);

  const {
    data: initialTokens,
    refetch: refetchInitialTokens,
    isFetching: tokensLoading,
  } = useTokensBalance(initialDefaultTokens, chainId, account);

  const swappableTokens = initialTokens
    ?.map((token) => {
      return {
        addressToSwap: token.address,
        addressForUsdPrice: token.address,
        underlyingAddress: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        chainId,
        logoURI: token.logoURI,
        tokenType: token.extensions?.isNative ? TokenType.NATIVE : TokenType.ERC20,
      };
    })
    .filter((token) => token.balance !== '0')
    .sort((a, b) => Number(b.balance) - Number(a.balance));

  const defaultInputToken = getDefaultInputToken(swappableTokens ?? [], underlyingAsset ?? '');
  const defaultOutputToken = getDefaultOutputToken(swappableTokens ?? []);

  const invalidateAppState = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.transactionHistory(
        account,
        findByChainId(chainId) ?? currentMarketData
      ),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.poolTokens(account, currentMarketData),
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
    sourceTokens: swappableTokens,
    destinationTokens: swappableTokens,
    chainId,
    refreshTokens,
    supportedNetworks: supportedNetworksWithEnabledMarket,
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
