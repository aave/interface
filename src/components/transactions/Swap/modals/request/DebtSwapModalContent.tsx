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
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { NetworkConfig } from 'src/ui-config/networksConfig';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { useShallow } from 'zustand/shallow';

import { invalidateAppStateForSwap } from '../../helpers/shared';
import { SwappableToken, SwapParams, SwapType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';

export const DebtSwapModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { user, reserves } = useAppDataContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const [account, chainId, currentMarket] = useRootStore(
    useShallow((store) => [store.account, store.currentChainId, store.currentMarket])
  );

  const tokensFrom = getTokensFrom(user, currentNetworkConfig.wagmiChain.id, currentNetworkConfig);
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
    invalidateAppStateForSwap({
      swapType: SwapType.DebtSwap,
      chainId,
      account,
      queryClient,
    });
  };

  const params: Partial<SwapParams> = {
    swapType: SwapType.DebtSwap,
    allowLimitOrders: true,
    forcedInputToken: defaultInputToken,
    suggestedDefaultOutputToken: defaultOutputToken,
    invalidateAppState,
    sourceTokens: tokensFrom,
    destinationTokens: tokensTo,
    showSwitchInputAndOutputAssetsButton: false,
    chainId: currentNetworkConfig.wagmiChain.id,
    titleTokenPostfix: 'debt',
    resultScreenTokensFromTitle: 'Debt sent',
    resultScreenTokensToTitle: 'Debt received',
    resultScreenTitleItems: 'debt',
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
          nativeToken?.logoURI ??
          tokenFromList?.logoURI ??
          `/icons/tokens/${borrowPosition.reserve.iconSymbol.toLowerCase()}.svg`,
        usdPrice: borrowPosition.reserve.priceInUSD,
        supplyAPY: borrowPosition.reserve.supplyAPY,
        variableBorrowAPY: borrowPosition.reserve.variableBorrowAPY,
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
        logoURI:
          nativeToken?.logoURI ??
          tokenFromList?.logoURI ??
          `/icons/tokens/${reserve.iconSymbol.toLowerCase()}.svg`,
        chainId,
        decimals: reserve.decimals,
        symbol: nativeToken?.symbol ?? tokenFromList?.symbol ?? reserve.symbol,
        balance: availableBorrows.toString(),
        usdPrice: reserve.priceInUSD,
        supplyAPY: reserve.supplyAPY,
        variableBorrowAPY: reserve.variableBorrowAPY,

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
      // Filter out tokens that match by addressToSwap OR underlyingAddress
      // This prevents the same asset from appearing in both lists
      token.addressToSwap.toLowerCase() !== defaultInputToken?.addressToSwap.toLowerCase() &&
      token.underlyingAddress.toLowerCase() !==
        defaultInputToken?.underlyingAddress.toLowerCase() &&
      token.symbol !== defaultInputToken?.symbol
  );
};
