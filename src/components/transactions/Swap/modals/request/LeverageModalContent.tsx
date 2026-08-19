import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { useQueryClient } from '@tanstack/react-query';
import {
  ComputedReserveData,
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
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { invalidateAppStateForSwap } from '../../helpers/shared';
import { SwappableToken, SwapParams, SwapType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';

/**
 * Leverage buys collateral with a flash-loaned debt asset, so the source list is what the user can
 * hold as collateral and the destination list is what they can borrow. The swap is inverted: the
 * first input is the collateral to acquire, the second is the debt that finances it.
 */
export const LeverageModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { user, reserves } = useAppDataContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const [account, chainId, currentMarket] = useRootStore(
    useShallow((store) => [store.account, store.currentChainId, store.currentMarket])
  );
  const queryClient = useQueryClient();

  const chainIdForTokens = currentNetworkConfig.wagmiChain.id;
  const collateralTokens = getCollateralTokens(
    user,
    reserves,
    chainIdForTokens,
    currentMarket,
    currentNetworkConfig
  );
  const borrowableTokens = getBorrowableTokens(
    user,
    reserves,
    chainIdForTokens,
    currentMarket,
    currentNetworkConfig
  );

  const defaultCollateralToken =
    collateralTokens.find(
      (token) => token.underlyingAddress.toLowerCase() === underlyingAsset?.toLowerCase()
    ) ?? collateralTokens[0];
  const defaultDebtToken = borrowableTokens.find(
    (token) =>
      token.underlyingAddress.toLowerCase() !==
      defaultCollateralToken?.underlyingAddress.toLowerCase()
  );

  const invalidateAppState = () => {
    invalidateAppStateForSwap({
      swapType: SwapType.Leverage,
      chainId,
      account,
      queryClient,
    });
  };

  const collateralUserReserve = user?.userReservesData.find(
    (userReserve) =>
      userReserve.underlyingAsset.toLowerCase() ===
      defaultCollateralToken?.underlyingAddress.toLowerCase()
  );
  const debtUserReserve = user?.userReservesData.find(
    (userReserve) =>
      userReserve.underlyingAsset.toLowerCase() ===
      defaultDebtToken?.underlyingAddress.toLowerCase()
  );

  const params: Partial<SwapParams> = {
    swapType: SwapType.Leverage,
    allowLimitOrders: true,
    forcedInputToken: defaultCollateralToken,
    suggestedDefaultOutputToken: defaultDebtToken,
    invalidateAppState,
    sourceTokens: collateralTokens,
    destinationTokens: borrowableTokens,
    showSwitchInputAndOutputAssetsButton: false,
    showOutputBalance: true,
    outputBalanceTitle: 'Available',
    chainId: chainIdForTokens,
    titleTokenPostfix: 'position',
    sourceReserve: collateralUserReserve,
    destinationReserve: debtUserReserve,
    resultScreenTokensFromTitle: 'Collateral added',
    resultScreenTokensToTitle: 'Debt drawn',
    resultScreenTitleItems: 'position',

    // Note: the leverage order is inverted; the first input is the collateral acquired.
    inputInputTitleBuy: 'Supply',
    outputInputTitleBuy: 'Borrow at most',
    inputInputTitleSell: 'Supply at least',
    outputInputTitleSell: 'Borrow',
  };

  return <BaseSwapModalContent params={params} />;
};

const nativeOverride = (underlyingAsset: string, chainId: number) => {
  const isWrappedNative =
    WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address?.toLowerCase() ===
    underlyingAsset.toLowerCase();
  return isWrappedNative
    ? TOKEN_LIST.tokens.find(
        (token) => (token as TokenInfoWithBalance).extensions?.isNative && token.chainId === chainId
      )
    : undefined;
};

/** Assets the user can end up holding as collateral, which is what leverage buys. */
const getCollateralTokens = (
  user: ExtendedFormattedUser | undefined,
  reserves: ComputedReserveData[],
  chainId: number,
  currentMarket: CustomMarket,
  currentNetworkConfig: NetworkConfig
): SwappableToken[] => {
  if (!user) return [];

  return reserves
    .filter(
      (reserve) =>
        !reserve.isFrozen &&
        !reserve.isPaused &&
        // The adapter enforces the bought asset is used as collateral, so an asset that cannot be
        // is not a leverage target.
        reserve.baseLTVasCollateral !== '0' &&
        !displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket })
    )
    .filter((reserve) => !isAssetHidden(currentMarket, reserve.underlyingAsset))
    .map<SwappableToken>((reserve) => {
      const nativeToken = nativeOverride(reserve.underlyingAsset, chainId);
      const currentCollateral =
        user.userReservesData.find(
          (position) =>
            position.reserve.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
        )?.underlyingBalance ?? '0';

      return {
        addressToSwap: reserve.underlyingAsset,
        addressForUsdPrice: reserve.underlyingAsset,
        underlyingAddress: reserve.underlyingAsset,
        name: nativeToken?.name ?? reserve.name,
        symbol: nativeToken?.symbol ?? reserve.symbol,
        logoURI: nativeToken?.logoURI ?? `/icons/tokens/${reserve.iconSymbol.toLowerCase()}.svg`,
        balance: currentCollateral,
        chainId,
        decimals: reserve.decimals,
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
    .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
};

/** Assets the user can borrow, which is what funds the leverage. */
const getBorrowableTokens = (
  user: ExtendedFormattedUser | undefined,
  reserves: ComputedReserveData[],
  chainId: number,
  currentMarket: CustomMarket,
  currentNetworkConfig: NetworkConfig
): SwappableToken[] => {
  if (!user) return [];

  return reserves
    .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
    .filter((reserve) => !isAssetHidden(currentMarket, reserve.underlyingAsset))
    .map<SwappableToken>((reserve) => {
      const nativeToken = nativeOverride(reserve.underlyingAsset, chainId);

      return {
        addressToSwap: reserve.underlyingAsset,
        addressForUsdPrice: reserve.underlyingAsset,
        underlyingAddress: reserve.underlyingAsset,
        name: nativeToken?.name ?? reserve.name,
        symbol: nativeToken?.symbol ?? reserve.symbol,
        logoURI: nativeToken?.logoURI ?? `/icons/tokens/${reserve.iconSymbol.toLowerCase()}.svg`,
        balance: getMaxAmountAvailableToBorrow(reserve, user).toString(),
        chainId,
        decimals: reserve.decimals,
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
    });
};
