import { BasicModal } from 'src/components/primitives/BasicModal';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { TokenInfo } from 'src/ui-config/TokenList';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { BaseSwitchModal } from '../BaseSwitchModal';

const sortByBalance = (a: TokenInfoWithBalance, b: TokenInfoWithBalance) => {
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
};

export const CollateralSwapModal = () => {
  const { args, type, close } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const { underlyingAsset } = args;

  const { user, reserves } = useAppDataContext();
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
      invariant(baseToken, 'Base token should exist');
      // Prefer showing native symbol (e.g., ETH) instead of WETH when applicable, but keep underlying address
      const realChainId = currentNetworkConfig.wagmiChain.id;
      const networkConfig = getNetworkConfig(realChainId);
      const isWrappedBaseAsset = position.reserve.isWrappedBaseAsset;

      return {
        ...baseToken,
        symbol: isWrappedBaseAsset ? networkConfig.baseAssetSymbol : baseToken.symbol,
        logoURI: isWrappedBaseAsset
          ? `/icons/tokens/${networkConfig.baseAssetSymbol}.svg`
          : baseToken.logoURI,
        balance: position.underlyingBalance,
        aToken: position.reserve.aTokenAddress,
      };
    })
    .filter((token) => token !== undefined)
    .sort(sortByBalance);

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

      invariant(baseToken, 'Base token should exist');

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
    .sort(sortByBalance);

  const userSelectedInputToken = tokensFrom.find(
    (token) => token.address.toLowerCase() === underlyingAsset?.toLowerCase()
  );
  const defaultInputToken =
    userSelectedInputToken ||
    (tokensFrom.find((token) => token.address.toLowerCase() === underlyingAsset?.toLowerCase()) ??
    tokensFrom.length > 0
      ? tokensFrom[0]
      : undefined);
  const defaultOutputToken =
    tokensTo.length > 0
      ? tokensTo.filter((token) => token.address !== defaultInputToken?.address)[0]
      : undefined;

  return (
    <BasicModal open={type === ModalType.CollateralSwap} setOpen={close}>
      <BaseSwitchModal
        modalType={ModalType.CollateralSwap}
        tokensFrom={tokensFrom}
        tokensTo={tokensTo}
        forcedDefaultInputToken={defaultInputToken}
        forcedDefaultOutputToken={defaultOutputToken}
        showSwitchInputAndOutputAssetsButton={false}
        forcedChainId={currentNetworkConfig.wagmiChain.id}
      />
    </BasicModal>
  );
};
