import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { Box, CircularProgress } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { useRootStore } from 'src/store/root';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import { useShallow } from 'zustand/shallow';

import { invalidateAppStateForSwap } from '../../helpers/shared';
import { SwappableToken, SwapParams, SwapType, TokenType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';
import { getDefaultOutputToken, getFilteredTokensForSwitch } from './SwapModalContent';

export const WithdrawAndSwapModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { account, chainIdInApp: chainId } = useRootStore(
    useShallow((store) => ({
      account: store.account,
      chainIdInApp: store.currentChainId,
    }))
  );

  const queryClient = useQueryClient();
  const { user } = useAppDataContext();

  const initialDefaultTokens = useMemo(() => getFilteredTokensForSwitch(chainId), [chainId]);

  const tokensFrom = getTokensFrom(user, initialDefaultTokens, chainId);

  const reserves = useAppDataContext().reserves;
  const { data: initialTokens, isFetching: tokensLoading } = useTokensBalance(
    initialDefaultTokens,
    chainId,
    account
  );

  const swappableTokens = initialTokens
    ?.map((token) => {
      const reserve = reserves.find(
        (reserve) => reserve.underlyingAsset.toLowerCase() === token.address.toLowerCase()
      );
      return {
        addressToSwap: token.address,
        addressForUsdPrice: token.address,
        underlyingAddress: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        chainId,
        usdPrice: reserve?.priceInUSD,
        logoURI: token.logoURI,
        tokenType: token.extensions?.isNative ? TokenType.NATIVE : TokenType.ERC20,
      };
    })
    .filter((token) => token.balance !== '0')
    .sort((a, b) => Number(b.balance) - Number(a.balance));

  const invalidateAppState = () => {
    invalidateAppStateForSwap({
      swapType: SwapType.WithdrawAndSwap,
      chainId,
      account,
      queryClient,
    });
  };

  const defaultInputToken = tokensFrom.find(
    (token) => token.underlyingAddress.toLowerCase() === underlyingAsset?.toLowerCase()
  );
  const defaultOutputToken = getDefaultOutputToken(swappableTokens ?? [], underlyingAsset);

  const params: Partial<SwapParams> = {
    swapType: SwapType.WithdrawAndSwap,
    allowLimitOrders: true,
    invalidateAppState,
    sourceTokens: tokensFrom,
    destinationTokens: swappableTokens,
    chainId,
    suggestedDefaultOutputToken: defaultOutputToken,
    suggestedDefaultInputToken: defaultInputToken,
    showTitle: false,
    showSwitchInputAndOutputAssetsButton: false,
    titleTokenPostfix: 'and swap',
    inputBalanceTitle: 'Available',
    outputBalanceTitle: 'Current balance',
    showOutputBalance: true,
    inputInputTitle: 'Withdraw',
    outputInputTitle: 'And swap to',
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

// Tokens from are all current open supply positions
const getTokensFrom = (
  user: ExtendedFormattedUser | undefined,
  baseTokensInfo: TokenInfo[],
  chainId: number
): SwappableToken[] => {
  // Tokens From should be the supplied tokens
  const suppliedPositions =
    user?.userReservesData.filter((userReserve) => userReserve.underlyingBalance !== '0') || [];

  return suppliedPositions
    .map<SwappableToken | undefined>((position) => {
      const baseToken = baseTokensInfo.find(
        (baseToken) =>
          baseToken.address.toLowerCase() === position.reserve.underlyingAsset.toLowerCase()
      );
      if (baseToken) {
        // Prefer showing native symbol (e.g., ETH) instead of WETH when applicable, but keep underlying address
        const wrappedNative =
          WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address?.toLowerCase();
        const isWrappedNative =
          wrappedNative && position.reserve.underlyingAsset.toLowerCase() === wrappedNative;
        const nativeToken = isWrappedNative
          ? TOKEN_LIST.tokens.find(
              (t) => (t as TokenInfoWithBalance).extensions?.isNative && t.chainId === chainId
            )
          : undefined;

        return {
          addressToSwap: position.reserve.aTokenAddress,
          addressForUsdPrice: position.reserve.aTokenAddress,
          underlyingAddress: position.reserve.underlyingAsset,
          decimals: baseToken.decimals,
          symbol: nativeToken?.symbol ?? baseToken.symbol,
          name: baseToken.name,
          balance: position.underlyingBalance,
          chainId,
          usdPrice: position.reserve.priceInUSD,
          logoURI: nativeToken?.logoURI ?? baseToken.logoURI,
        };
      }
      return undefined;
    })
    .filter((token) => token !== undefined)
    .sort((a, b) => {
      const aBalance = parseFloat(a?.balance ?? '0');
      const bBalance = parseFloat(b?.balance ?? '0');
      if (bBalance !== aBalance) {
        return bBalance - aBalance;
      }
      // If balances are equal, sort by symbol alphabetically
      const aSymbol = a?.symbol?.toLowerCase() ?? '';
      const bSymbol = b?.symbol?.toLowerCase() ?? '';
      if (aSymbol < bSymbol) return -1;
      if (aSymbol > bSymbol) return 1;
      return 0;
    });
};
