import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { useQueryClient } from '@tanstack/react-query';
import {
  ComputedUserReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useRootStore } from 'src/store/root';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { NetworkConfig } from 'src/ui-config/networksConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import { useShallow } from 'zustand/shallow';

import { SwappableToken, SwapParams, SwapType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';

export const RepayWithCollateralModalContent = ({
  underlyingAsset,
  debtType: interestMode,
}: {
  underlyingAsset: string;
  debtType: InterestRate;
}) => {
  const { user, reserves } = useAppDataContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const [account, chainId, currentMarketData] = useRootStore(
    useShallow((store) => [store.account, store.currentChainId, store.currentMarketData])
  );

  const baseTokens: TokenInfo[] = reserves.map((reserve) => {
    return {
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      logoURI: `/icons/tokens/${reserve.iconSymbol.toLowerCase()}.svg`,
      chainId: currentNetworkConfig.wagmiChain.id,
      name: reserve.name,
      decimals: reserve.decimals,
    };
  });

  const tokensFrom = getTokensFrom(user, currentNetworkConfig.wagmiChain.id, currentNetworkConfig);
  const tokensTo = getTokensTo(user, baseTokens, currentNetworkConfig.wagmiChain.id);
  const defaultInputToken = tokensFrom.find(
    (token) => token.underlyingAddress.toLowerCase() === underlyingAsset?.toLowerCase() // TODO: Check
  );

  // Collateral with highest balance
  const defaultOutputToken = tokensTo.sort((a, b) => Number(b.balance) - Number(a.balance))[0];

  const queryClient = useQueryClient();

  // TODO: debt type check!!
  const invalidateAppState = () => {
    // A collateral swap should refresh collateral, user reserves, transaction history and pool tokens
    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.poolReservesDataHumanized(
        findByChainId(chainId) ?? currentMarketData
      ),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.userPoolReservesDataHumanized(
        account,
        findByChainId(chainId) ?? currentMarketData
      ),
    });

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

  const params: Partial<SwapParams> = {
    swapType: SwapType.RepayWithCollateral,
    // allowLimitOrders: false,
    invalidateAppState,
    sourceTokens: tokensFrom,
    destinationTokens: tokensTo,
    chainId,
    suggestedDefaultOutputToken: defaultOutputToken,
    suggestedDefaultInputToken: defaultInputToken,
    showTitle: false,
    showSwitchInputAndOutputAssetsButton: false,
    titleTokenPostfix: 'with collateral',
    inputBalanceTitle: 'Repay',
    outputBalanceTitle: 'Available collateral',
    showOutputBalance: true,
    inputInputTitle: 'Repay',
    outputInputTitle: 'Using',
    interestMode,
    resultScreenTokensFromTitle: 'Repay',
    resultScreenTokensToTitle: 'With',
    resultScreenTitleItems: 'repay',
    customReceivedTitle: 'Repaid',
  };

  return <BaseSwapModalContent params={params} />;
};

// Tokens from are all current open debt positions
const getTokensFrom = (
  user: ExtendedFormattedUser | undefined,
  chainId: number,
  currentNetworkConfig: NetworkConfig
): SwappableToken[] => {
  if (!user) return [];

  const borrowPositions =
    user?.userReservesData.reduce((acc, userReserve) => {
      if (userReserve.variableBorrows !== '0') {
        acc.push({
          ...userReserve,
          borrowRateMode: InterestRate.Variable,
          reserve: {
            ...userReserve.reserve,
            ...(userReserve.reserve.isWrappedBaseAsset
              ? fetchIconSymbolAndName({
                  symbol: currentNetworkConfig.baseAssetSymbol,
                  underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                })
              : {}),
          },
        });
      }
      return acc;
    }, [] as (ComputedUserReserveData & { borrowRateMode: InterestRate })[]) || [];

  return borrowPositions
    .map<SwappableToken | undefined>((borrowPosition) => {
      // Find the token in the TokenList for proper logoURI and symbol if native
      const tokenFromList = TOKEN_LIST.tokens.find(
        (t) =>
          t.address?.toLowerCase() === borrowPosition.reserve.underlyingAsset.toLowerCase() &&
          t.chainId === chainId
      );

      // Prefer showing native symbol if it matches and available
      const isWrappedNative =
        WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address?.toLowerCase() ===
        borrowPosition.reserve.underlyingAsset.toLowerCase();
      const nativeToken = isWrappedNative
        ? TOKEN_LIST.tokens.find(
            (t) => (t as TokenInfoWithBalance).extensions?.isNative && t.chainId === chainId
          )
        : undefined;

      if (!tokenFromList) return undefined;

      const initialSourceUserReserve = user?.userReservesData.find(
        (userReserve) =>
          userReserve.underlyingAsset.toLowerCase() === borrowPosition.underlyingAsset.toLowerCase()
      );
      const initialTargetUserReserve = user?.userReservesData.find(
        (userReserve) =>
          userReserve.underlyingAsset.toLowerCase() === borrowPosition.underlyingAsset.toLowerCase()
      );

      return {
        addressToSwap: borrowPosition.underlyingAsset,
        addressForUsdPrice: borrowPosition.underlyingAsset,
        underlyingAddress: borrowPosition.underlyingAsset,
        name: borrowPosition.reserve.name,
        balance: borrowPosition.variableBorrows,
        chainId,
        decimals: borrowPosition.reserve.decimals,
        symbol: nativeToken?.symbol ?? tokenFromList?.symbol ?? borrowPosition.reserve.symbol,
        logoURI:
          nativeToken?.logoURI ?? tokenFromList?.logoURI ?? borrowPosition.reserve.iconSymbol,
        sourceReserve: initialSourceUserReserve,
        destinationReserve: initialTargetUserReserve,
      };
    })
    .filter((token) => token !== undefined);
};

// Tokens to are all supplied tokens
const getTokensTo = (
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
          underlyingAddress: position.reserve.underlyingAsset, // TODO: Check
          decimals: baseToken.decimals,
          symbol: nativeToken?.symbol ?? baseToken.symbol,
          name: baseToken.name,
          balance: position.underlyingBalance,
          chainId,
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
