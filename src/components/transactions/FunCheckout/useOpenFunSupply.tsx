import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { isFunSupplyAsset } from './funSupplyAssets';
import { beginFunSupply } from './funSupplyBridge';

/** Fields the native supply modal passes when the user opts into funkit's deposit options. */
export type OpenFunSupplyReserve = {
  underlyingAsset: string;
  /** Patched display symbol of the underlying (drives the funkit checkout title). */
  symbol: string;
  /** Ringed aToken icon data URI from useFunSupplyATokenIcon. */
  aTokenBase64?: string;
  /** Aave's `supplyAPY` — a 0–1 fraction. */
  supplyAPY: string | number;
  /** Whether this supply is/will be enabled as collateral for the user. */
  collateralEnabled: boolean;
};

/**
 * Returns a handler that opens the funkit checkout for an allowlisted Core
 * mainnet asset. Native deposits always go through the Aave supply modal; this
 * is only reached from its "other ways to deposit" link (swaps, cross-chain,
 * card and exchange deposits).
 *
 * Returns false when nothing was opened — the asset isn't fun-routed, the
 * funkit island hasn't mounted yet (ssr:false chunk still loading) or the SDK
 * market data isn't in yet — so the caller can keep the native modal open.
 *
 * Receipt-token metadata (the aToken's address/symbol/decimals/icon) comes from
 * the SDK reserve already in app state — no integrator-owned copies.
 */
export function useOpenFunSupply(): (reserve: OpenFunSupplyReserve) => boolean {
  const currentMarket = useRootStore((store) => store.currentMarket);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { supplyReserves } = useAppDataContext();

  return (reserve: OpenFunSupplyReserve) => {
    if (!isFunSupplyAsset(currentMarket, reserve.underlyingAsset)) {
      return false;
    }
    const sdkReserve = supplyReserves.find(
      (r) => r.underlyingToken.address.toLowerCase() === reserve.underlyingAsset.toLowerCase()
    );
    if (!sdkReserve) {
      return false;
    }
    return beginFunSupply({
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
  };
}
