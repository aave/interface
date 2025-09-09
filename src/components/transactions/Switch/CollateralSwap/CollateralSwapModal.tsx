import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

import { BaseSwitchModal } from '../BaseSwitchModal';
import { SwitchDetailsParams as SwitchDetailsParams } from '../BaseSwitchModalContent';
import { SwitchModalTxDetails } from '../SwitchModalTxDetails';

export const CollateralSwapModal = () => {
  const { args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const { underlyingAsset } = args;

  const switchDetails = ({
    switchRates,
    gasLimit,
    selectedChainId,
    selectedOutputToken,
    selectedInputToken,
    safeSlippage,
    showGasStation,
  }: SwitchDetailsParams & { selectedInputToken: TokenInfoWithBalance }) => {
    return (
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
    );
  };

  const { user, reserves } = useAppDataContext();
  const currentMarket = useRootStore((store) => store.currentMarket);
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
        const realChainId = currentNetworkConfig.wagmiChain.id;
        const wrappedNative =
          WRAPPED_NATIVE_CURRENCIES[realChainId as SupportedChainId]?.address?.toLowerCase();
        const isWrappedNative =
          wrappedNative && position.reserve.underlyingAsset.toLowerCase() === wrappedNative;
        const nativeToken = isWrappedNative
          ? TOKEN_LIST.tokens.find(
              (t) => (t as TokenInfoWithBalance).extensions?.isNative && t.chainId === realChainId
            )
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

  // Tokens To should be the potential supply tokens (so we have an aToken)
  const tokensToSupply = reserves.filter(
    (reserve: ComputedReserveData) =>
      !(reserve.isFrozen || reserve.isPaused) &&
      !displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket: currentMarket })
  );
  const tokensTo = tokensToSupply
    .map((reserve) => {
      // Find the base token for this reserve
      const baseToken = baseTokens.find(
        (baseToken) => baseToken.address.toLowerCase() === reserve.underlyingAsset.toLowerCase()
      );

      if (!baseToken) return undefined;

      const currentCollateral =
        suppliedPositions.find(
          (position) =>
            position.reserve.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
        )?.underlyingBalance ?? '0';

      return {
        ...baseToken,
        aToken: reserve.aTokenAddress,
        balance: currentCollateral,
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

  const userSelectedInputToken = tokensFrom.find(
    (token) => token.address.toLowerCase() === underlyingAsset?.toLowerCase()
  );
  const defaultInputToken =
    userSelectedInputToken ||
    (tokensFrom.find((token) => token.address.toLowerCase() === underlyingAsset?.toLowerCase()) ??
    tokensFrom.length > 0
      ? tokensFrom[0]
      : undefined);

  return (
    // Only forcedDefaultInputToken forced
    <BaseSwitchModal
      modalType={ModalType.CollateralSwap}
      switchDetails={switchDetails}
      tokensFrom={tokensFrom}
      tokensTo={tokensTo}
      forcedDefaultInputToken={defaultInputToken}
      showSwitchInputAndOutputAssetsButton={false}
      forcedChainId={currentNetworkConfig.wagmiChain.id}
    />
  );
};
