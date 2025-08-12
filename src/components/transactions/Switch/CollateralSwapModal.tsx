import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { BaseSwitchModal } from './BaseSwitchModal';
import {
  getFilteredTokensForSwitch,
  SwitchDetailsParams as SwitchDetailsParams,
} from './BaseSwitchModalContent';
import { SwitchModalTxDetails } from './SwitchModalTxDetails';

export const CollateralSwapModal = () => {
  const { args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const { underlyingAsset } = args;

  const switchDetails = ({
    user: _userAddress,
    switchRates,
    gasLimit,
    selectedChainId,
    selectedOutputToken,
    selectedInputToken,
    safeSlippage,
    showGasStation,
  }: SwitchDetailsParams & { selectedInputToken: TokenInfoWithBalance; ratesLoading: boolean }) => {
    if (!switchRates || !_userAddress || !user) return null;
    return switchRates ? (
      <SwitchModalTxDetails
        switchRates={switchRates}
        selectedOutputToken={selectedOutputToken}
        safeSlippage={safeSlippage}
        gasLimit={gasLimit}
        selectedChainId={selectedChainId}
        showGasStation={showGasStation}
        customReceivedTitle={<Trans>Minimum new collateral</Trans>}
        reserves={reserves}
        user={user}
        selectedInputToken={selectedInputToken}
        modalType={ModalType.CollateralSwap}
      />
    ) : null;
  };

  const { user, reserves } = useAppDataContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const baseTokens = getFilteredTokensForSwitch(currentNetworkConfig.wagmiChain.id, true);

  // Tokens From should be the supplied tokens
  const suppliedPositions =
    user?.userReservesData.filter((userReserve) => userReserve.underlyingBalance !== '0') || [];

  const tokensFrom = suppliedPositions
    .map((position) => {
      const baseToken = baseTokens.find(
        (baseToken) =>
          baseToken.address.toLowerCase() === position.reserve.underlyingAsset.toLowerCase()
      );
      if (baseToken) {
        // Prefer showing native symbol (e.g., ETH) instead of WETH when applicable, but keep underlying address
        const realChainId =
          currentNetworkConfig.underlyingChainId || currentNetworkConfig.wagmiChain.id;
        const wrappedNative =
          WRAPPED_NATIVE_CURRENCIES[realChainId as SupportedChainId]?.address?.toLowerCase();
        const isWrappedNative =
          wrappedNative && position.reserve.underlyingAsset.toLowerCase() === wrappedNative;
        const nativeToken = isWrappedNative
          ? baseTokens.find((t) => (t as TokenInfoWithBalance).extensions?.isNative)
          : undefined;

        return {
          ...baseToken,
          symbol: nativeToken?.symbol ?? baseToken.symbol,
          logoURI: nativeToken?.logoURI ?? baseToken.logoURI,
          balance: position.underlyingBalance,
          aToken: position.reserve.aTokenAddress,
        };
      }
      return undefined;
    })
    .filter((token) => token !== undefined);

  // Tokens To should be the potential supply tokens (so we have an aToken)
  const tokensToSupply = reserves.filter(
    (reserve: ComputedReserveData) => !(reserve.isFrozen || reserve.isPaused)
  );
  const tokensTo = tokensToSupply
    .map((reserve) => {
      // Find the base token for this reserve
      const baseToken = baseTokens.find(
        (baseToken) => baseToken.address.toLowerCase() === reserve.underlyingAsset.toLowerCase()
      );

      if (!baseToken) return undefined;

      // Prefer showing native symbol (e.g., ETH) instead of WETH when applicable, but keep underlying address
      const realChainId =
        currentNetworkConfig.underlyingChainId || currentNetworkConfig.wagmiChain.id;
      const wrappedNative =
        WRAPPED_NATIVE_CURRENCIES[realChainId as SupportedChainId]?.address?.toLowerCase();
      const isWrappedNative =
        wrappedNative && reserve.underlyingAsset.toLowerCase() === wrappedNative;
      const nativeToken = isWrappedNative
        ? baseTokens.find((t) => (t as TokenInfoWithBalance).extensions?.isNative)
        : undefined;

      return {
        ...baseToken,
        symbol: nativeToken?.symbol ?? baseToken.symbol,
        logoURI: nativeToken?.logoURI ?? baseToken.logoURI,
        aToken: reserve.aTokenAddress,
      };
    })
    .filter((token) => token !== undefined);

  // TODO: what if no tokens are found?

  const defaultInputToken =
    tokensFrom.find((token) => token.address.toLowerCase() === underlyingAsset?.toLowerCase()) ??
    tokensFrom[0];
  const defaultOutputToken = tokensTo.filter(
    (token) => token.address !== defaultInputToken?.address
  )[0];

  return (
    <BaseSwitchModal
      modalType={ModalType.CollateralSwap}
      switchDetails={switchDetails}
      tokensFrom={tokensFrom}
      tokensTo={tokensTo}
      forcedDefaultInputToken={defaultInputToken}
      forcedDefaultOutputToken={defaultOutputToken}
    />
  );
};
