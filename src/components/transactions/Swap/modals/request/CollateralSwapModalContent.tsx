import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { useQueryClient } from '@tanstack/react-query';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { useRootStore } from 'src/store/root';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { invalidateAppStateForSwap } from '../../helpers/shared';
import { SwappableToken, SwapParams, SwapType } from '../../types';
import { BaseSwapModalContent } from './BaseSwapModalContent';

export const CollateralSwapModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { user, reserves } = useAppDataContext();
  const [account, chainId, currentMarketName] = useRootStore(
    useShallow((store) => [store.account, store.currentChainId, store.currentMarket])
  );
  const queryClient = useQueryClient();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
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

  const tokensFrom = getTokensFrom(user, baseTokens, chainId);
  const tokensTo = getTokensTo(user, reserves, baseTokens, currentMarketName, chainId);

  const userSelectedInputToken = tokensFrom.find(
    (token) => token.underlyingAddress.toLowerCase() === underlyingAsset?.toLowerCase()
  );
  const defaultInputToken =
    userSelectedInputToken ?? (tokensFrom.length > 0 ? tokensFrom[0] : undefined);

  const defaultOutputToken = getDefaultOutputToken(tokensTo, defaultInputToken);

  const invalidateAppState = () => {
    invalidateAppStateForSwap({
      swapType: SwapType.CollateralSwap,
      chainId,
      account,
      queryClient,
    });
  };

  const initialSourceUserReserve = user?.userReservesData.find(
    (userReserve) =>
      userReserve.underlyingAsset.toLowerCase() ===
      defaultInputToken?.underlyingAddress.toLowerCase()
  );
  const initialTargetUserReserve = user?.userReservesData.find(
    (userReserve) =>
      userReserve.underlyingAsset.toLowerCase() ===
      defaultOutputToken?.underlyingAddress.toLowerCase()
  );

  const params: Partial<SwapParams> = {
    swapType: SwapType.CollateralSwap,
    allowLimitOrders: true,
    forcedInputToken: defaultInputToken,
    suggestedDefaultOutputToken: defaultOutputToken,
    invalidateAppState,
    sourceTokens: tokensFrom,
    destinationTokens: tokensTo,
    showSwitchInputAndOutputAssetsButton: false,
    chainId: currentNetworkConfig.wagmiChain.id,
    titleTokenPostfix: 'supply',
    sourceReserve: initialSourceUserReserve,
    destinationReserve: initialTargetUserReserve,
    resultScreenTokensFromTitle: 'Collateral sent',
    resultScreenTokensToTitle: 'Collateral received',
    resultScreenTitleItems: 'collateral',
  };

  return <BaseSwapModalContent params={params} />;
};

const getDefaultOutputToken = (
  tokensTo: SwappableToken[],
  defaultInputToken: SwappableToken | undefined
) => {
  const tokensWithoutInputToken = tokensTo.filter(
    (token) =>
      // Filter out tokens that match by addressToSwap OR underlyingAddress OR symbol
      // This prevents the same asset from appearing in both lists (triple check for robustness)
      token.addressToSwap.toLowerCase() !== defaultInputToken?.addressToSwap.toLowerCase() &&
      token.underlyingAddress.toLowerCase() !==
        defaultInputToken?.underlyingAddress.toLowerCase() &&
      token.symbol !== defaultInputToken?.symbol
  );

  // 1. Highest balance
  const highestBalanceToken = tokensWithoutInputToken
    .filter((token) => token.balance !== '0')
    .sort((a, b) => Number(b.balance) - Number(a.balance));
  if (highestBalanceToken.length > 0) {
    return highestBalanceToken[0];
  }

  // 2. USDT or USDC or AAVE (but not the input token)
  const usdtOrUsdcOrAaveToken = tokensWithoutInputToken.filter(
    (token) =>
      (token.symbol === 'USDT' || token.symbol === 'USDC' || token.symbol === 'AAVE') &&
      token.symbol !== defaultInputToken?.symbol
  );
  if (usdtOrUsdcOrAaveToken.length > 0) {
    return usdtOrUsdcOrAaveToken[0];
  }

  // 3. Other not the default input token
  if (tokensWithoutInputToken.length > 0) {
    return tokensWithoutInputToken[0];
  }

  return undefined;
};

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
          supplyAPY: position.reserve.supplyAPY,
          variableBorrowAPY: position.reserve.variableBorrowAPY,
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

const getTokensTo = (
  user: ExtendedFormattedUser | undefined,
  reserves: ComputedReserveData[],
  baseTokensInfo: TokenInfo[],
  currentMarket: string,
  chainId: number
): SwappableToken[] => {
  // Tokens To should be the potential supply tokens (so we have an aToken)
  const tokensToSupply = reserves.filter(
    (reserve: ComputedReserveData) =>
      !(reserve.isFrozen || reserve.isPaused) &&
      !displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket: currentMarket })
  );

  const suppliedPositions =
    user?.userReservesData.filter((userReserve) => userReserve.underlyingBalance !== '0') || [];

  return tokensToSupply
    .map<SwappableToken | undefined>((reserve) => {
      // Find the base token for this reserve
      const baseToken = baseTokensInfo.find(
        (baseToken) => baseToken.address.toLowerCase() === reserve.underlyingAsset.toLowerCase()
      );

      if (!baseToken) return undefined;

      const currentCollateral =
        suppliedPositions.find(
          (position) =>
            position.reserve.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
        )?.underlyingBalance ?? '0';

      return {
        addressToSwap: reserve.aTokenAddress,
        addressForUsdPrice: reserve.aTokenAddress,
        underlyingAddress: reserve.underlyingAsset,
        decimals: baseToken.decimals,
        symbol: baseToken.symbol,
        name: baseToken.name,
        balance: currentCollateral,
        chainId,
        usdPrice: reserve.priceInUSD,
        supplyAPY: reserve.supplyAPY,
        variableBorrowAPY: reserve.variableBorrowAPY,
        logoURI: baseToken.logoURI,
      };
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
