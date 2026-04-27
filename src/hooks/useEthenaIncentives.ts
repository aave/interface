/**
 * Ethena partner incentive adapter over the V3 backend.
 *
 * Legacy signature: `useEthenaIncentives(rewardedAsset)` where
 * `rewardedAsset` is the aToken address. The hook now resolves the aToken
 * to its underlying via `useAppDataContext` and reads the
 * `StaticSupplyIncentive` variant where `partnerName === "Ethena"` from
 * `useReserveIncentives`. Callsites stay unchanged; the hardcoded
 * `ETHENA_DATA_MAP` is gone.
 */
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useReserveIncentives } from './useReserveIncentives';

/**
 * Returns the extra APR in percentage points (e.g. `5` for 5%) or
 * `undefined` if no Ethena partner incentive is active for the aToken's
 * underlying reserve.
 */
export const useEthenaIncentives = (rewardedAsset?: string): number | undefined => {
  const chainId = useRootStore((s) => s.currentChainId);
  const currentMarket = useRootStore((s) => s.currentMarket);
  const { supplyReserves } = useAppDataContext();

  // Resolve aToken → underlying via the reserves snapshot.
  const reserve = rewardedAsset
    ? supplyReserves.find((r) => r.aToken.address.toLowerCase() === rewardedAsset.toLowerCase())
    : undefined;
  const underlying = reserve?.underlyingToken.address;
  const market = reserve?.market.address ?? currentMarket;

  const { data } = useReserveIncentives({
    market: market ?? '',
    underlying: underlying ?? '',
    chainId,
    enabled: Boolean(market && underlying && chainId),
  });

  if (!data) return undefined;

  const ethena = data.find(
    (i) => i.__typename === 'StaticSupplyIncentive' && i.partnerName === 'Ethena'
  );
  if (!ethena || ethena.__typename !== 'StaticSupplyIncentive') return undefined;

  const value = parseFloat(ethena.extraApr.formatted);
  return Number.isFinite(value) ? value : undefined;
};
