import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { TokenInfo } from 'src/ui-config/TokenList';
import { useShallow } from 'zustand/shallow';

import { invalidateAppStateForSwap } from '../../helpers/shared';
import { SwapParams, SwapType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';
import { getTokensFrom as getSuppliedTokens } from './CollateralSwapModalContent';
import { getTokensTo as getBorrowableTokens } from './DebtSwapModalContent';

/**
 * Leverages a supplied collateral: a flash loan of the chosen debt asset buys more of it. The
 * order is inverted, the first input is the collateral bought and the second the debt drawn.
 */
export const LeverageModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { user, reserves } = useAppDataContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const [account, chainId, currentMarket] = useRootStore(
    useShallow((store) => [store.account, store.currentChainId, store.currentMarket])
  );
  const queryClient = useQueryClient();
  const chainIdForTokens = currentNetworkConfig.wagmiChain.id;

  const baseTokens: TokenInfo[] = reserves.map((reserve) => ({
    address: reserve.underlyingAsset,
    symbol: reserve.symbol,
    logoURI: `/icons/tokens/${reserve.iconSymbol.toLowerCase()}.svg`,
    chainId: chainIdForTokens,
    name: reserve.name,
    decimals: reserve.decimals,
  }));
  // Only the position the user opened the flow from is leveraged.
  const collateralTokens = getSuppliedTokens(user, baseTokens, chainId).filter(
    (token) => token.underlyingAddress.toLowerCase() === underlyingAsset?.toLowerCase()
  );
  const borrowableTokens = getBorrowableTokens(
    user,
    reserves,
    chainIdForTokens,
    currentMarket,
    currentNetworkConfig
  );

  const collateralToken = collateralTokens[0];
  const defaultDebtToken = borrowableTokens.find(
    (token) =>
      token.underlyingAddress.toLowerCase() !== collateralToken?.underlyingAddress.toLowerCase()
  );

  const invalidateAppState = () => {
    invalidateAppStateForSwap({
      swapType: SwapType.Leverage,
      chainId,
      account,
      queryClient,
    });
  };

  const findUserReserve = (address?: string) =>
    user?.userReservesData.find(
      (userReserve) => userReserve.underlyingAsset.toLowerCase() === address?.toLowerCase()
    );

  const params: Partial<SwapParams> = {
    swapType: SwapType.Leverage,
    allowLimitOrders: false,
    forcedInputToken: collateralToken,
    suggestedDefaultOutputToken: defaultDebtToken,
    invalidateAppState,
    sourceTokens: collateralTokens,
    destinationTokens: borrowableTokens,
    showSwitchInputAndOutputAssetsButton: false,
    showOutputBalance: true,
    outputBalanceTitle: 'Available',
    chainId: chainIdForTokens,
    titleTokenPostfix: 'position',
    sourceReserve: findUserReserve(collateralToken?.underlyingAddress),
    destinationReserve: findUserReserve(defaultDebtToken?.underlyingAddress),
    resultScreenTokensFromTitle: <Trans>Collateral added</Trans>,
    resultScreenTokensToTitle: <Trans>Debt drawn</Trans>,
    resultScreenTitleItems: <Trans>position</Trans>,

    inputInputTitleSell: 'Supply',
    outputInputTitleSell: 'Borrow',
    inputInputTitleBuy: 'Supply',
    outputInputTitleBuy: 'Borrow',
  };

  return <BaseSwapModalContent params={params} />;
};
