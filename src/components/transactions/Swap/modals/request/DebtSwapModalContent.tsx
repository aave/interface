import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { useQueryClient } from '@tanstack/react-query';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { isAssetHidden } from 'src/modules/dashboard/lists/constants';
import { useRootStore } from 'src/store/root';
import { CustomMarket, findByChainId } from 'src/ui-config/marketsConfig';
import { NetworkConfig } from 'src/ui-config/networksConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { useShallow } from 'zustand/shallow';

import { SwappableToken, SwapParams, SwapType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';

export const DebtSwapModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { user, reserves } = useAppDataContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const [account, chainId, currentMarketData, currentMarket] = useRootStore(
    useShallow((store) => [
      store.account,
      store.currentChainId,
      store.currentMarketData,
      store.currentMarket,
    ])
  );

  const tokensFrom = getTokensFrom(
    user,
    reserves,
    currentNetworkConfig.wagmiChain.id,
    currentNetworkConfig
  );
  const tokensTo = getTokensTo(
    user,
    reserves,
    currentNetworkConfig.wagmiChain.id,
    currentMarket,
    currentNetworkConfig
  );
  const defaultInputToken = getDefaultInputToken(tokensFrom, underlyingAsset);
  const defaultOutputToken = getDefaultOutputToken(tokensTo, defaultInputToken);
  const queryClient = useQueryClient();
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
    swapType: SwapType.DebtSwap,
    allowLimitOrders: true, // TODO: do we?
    forcedInputToken: defaultInputToken,
    suggestedDefaultOutputToken: defaultOutputToken,
    invalidateAppState,
    sourceTokens: tokensFrom,
    destinationTokens: tokensTo,
    showSwitchInputAndOutputAssetsButton: false, // TODO: do we?
    chainId: currentNetworkConfig.wagmiChain.id,
    titleTokenPostfix: 'debt',
    invertedQuoteRoute: true,
    resultScreenTokensPrefix: 'Debt ',
    resultScreenTitleItems: 'debt',
  };

  return <BaseSwapModalContent params={params} />;
};

// Tokens from are all current open debt positions
const getTokensFrom = (
  user: ExtendedFormattedUser | undefined,
  reserves: ComputedReserveData[],
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

// Tokens to are all potential borrow assets
const getTokensTo = (
  user: ExtendedFormattedUser | undefined,
  reserves: ComputedReserveData[],
  chainId: number,
  currentMarketData: CustomMarket,
  currentNetworkConfig: NetworkConfig
): SwappableToken[] => {
  if (!user) return [];

  return reserves
    .filter((reserve) => (user ? assetCanBeBorrowedByUser(reserve, user) : false))
    .filter((reserve) => !isAssetHidden(currentMarketData, reserve.underlyingAsset))
    .map<SwappableToken | undefined>((reserve: ComputedReserveData) => {
      const availableBorrows = user ? Number(getMaxAmountAvailableToBorrow(reserve, user)) : 0;

      const tokenFromList = TOKEN_LIST.tokens.find(
        (t) =>
          t.address?.toLowerCase() === reserve.underlyingAsset.toLowerCase() &&
          t.chainId === chainId
      );

      const isWrappedNative =
        WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address?.toLowerCase() ===
        reserve.underlyingAsset.toLowerCase();
      const nativeToken = isWrappedNative
        ? TOKEN_LIST.tokens.find(
            (t) => (t as TokenInfoWithBalance).extensions?.isNative && t.chainId === chainId
          )
        : undefined;

      if (!tokenFromList) return undefined;

      return {
        addressToSwap: reserve.underlyingAsset,
        addressForUsdPrice: reserve.underlyingAsset,
        underlyingAddress: reserve.underlyingAsset,
        name: nativeToken?.name ?? tokenFromList?.name ?? reserve.name,
        logoURI: nativeToken?.logoURI ?? tokenFromList?.logoURI ?? reserve.iconSymbol,
        chainId,
        decimals: reserve.decimals,
        symbol: nativeToken?.symbol ?? tokenFromList?.symbol ?? reserve.symbol,
        balance: availableBorrows.toString(), // TODO: Check

        ...(reserve.isWrappedBaseAsset
          ? fetchIconSymbolAndName({
              symbol: currentNetworkConfig.baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            })
          : {}),
      };
    })
    .filter((token) => token !== undefined);
};

const getDefaultInputToken = (tokens: SwappableToken[], underlyingAsset: string) => {
  return tokens.find(
    (token) => token.underlyingAddress.toLowerCase() === underlyingAsset?.toLowerCase()
  );
};

const getDefaultOutputToken = (
  tokens: SwappableToken[],
  defaultInputToken: SwappableToken | undefined
) => {
  return tokens.find(
    (token) =>
      token.addressToSwap !== defaultInputToken?.addressToSwap &&
      token.symbol !== defaultInputToken?.symbol
  );
};
