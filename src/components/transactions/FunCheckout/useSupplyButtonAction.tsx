import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { isFunSupplyAsset } from './funSupplyAssets';
import { beginFunSupply } from './funSupplyBridge';

/** Fields a Supply list item passes when its button is clicked. */
export type SupplyButtonReserve = {
  underlyingAsset: string;
  name: string;
  symbol: string;
  /** Ringed aToken icon data URI from useFunSupplyATokenIcon (fun-routed rows only). */
  aTokenBase64?: string;
  /** Aave's `supplyAPY` — a 0–1 fraction. */
  supplyAPY: string | number;
  /** `usageAsCollateralEnabledOnUser` from the reserve. */
  collateralEnabled: boolean;
};

/**
 * Returns the Supply button's click handler. For the allowlisted assets on the
 * Core mainnet market it opens the funkit checkout modal; for everything else it
 * falls back to the native Aave supply modal (`openSupply`). Shared by all 3
 * Supply list-item variants so the branch lives in one place.
 *
 * Receipt-token metadata (the aToken's address/symbol/decimals/icon) comes from
 * the SDK reserve already in app state — no integrator-owned copies.
 */
export function useSupplyButtonAction(): (reserve: SupplyButtonReserve) => void {
  const currentMarket = useRootStore((store) => store.currentMarket);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { supplyReserves } = useAppDataContext();
  const { openSupply } = useModalContext();

  return (reserve: SupplyButtonReserve) => {
    if (isFunSupplyAsset(currentMarket, reserve.underlyingAsset)) {
      const sdkReserve = supplyReserves.find(
        (r) => r.underlyingToken.address.toLowerCase() === reserve.underlyingAsset.toLowerCase()
      );
      const handled =
        !!sdkReserve &&
        beginFunSupply({
          underlyingAsset: reserve.underlyingAsset,
          symbol: reserve.symbol,
          aTokenBase64: reserve.aTokenBase64,
          supplyAPY: reserve.supplyAPY,
          collateralEnabled: reserve.collateralEnabled,
          chainId: currentMarketData.chainId,
          poolAddress: currentMarketData.addresses.LENDING_POOL,
          underlyingImageUrl: sdkReserve.underlyingToken.imageUrl,
          aToken: sdkReserve.aToken,
        });
      if (handled) {
        return;
      }
      // Fall through to the native modal when the funkit island hasn't mounted
      // yet (ssr:false chunk still loading) or the SDK market data isn't in
      // yet — instead of dropping the click.
    }
    openSupply(reserve.underlyingAsset, currentMarket, reserve.name, 'dashboard');
  };
}
