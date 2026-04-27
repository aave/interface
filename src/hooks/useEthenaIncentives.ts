/**
 * Ethena partner incentive adapter over the V3 backend.
 *
 * Legacy signature: `useEthenaIncentives(rewardedAsset)` where
 * `rewardedAsset` is the aToken address. The hook now resolves the aToken
 * to its underlying via `useAppDataContext` and reads the
 * `SupplyPointsIncentive` variant whose `program.name === "Ethena Rewards"`
 * from `useReserveIncentives`. Callsites stay unchanged; the hardcoded
 * `ETHENA_DATA_MAP` is gone. Ethena pays in airdrop / sats multipliers,
 * not in APR — see `EthenaAirdropTooltipContent` for the rendering.
 */
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useReserveIncentives } from './useReserveIncentives';

/**
 * Returns the Ethena Rewards multiplier (e.g. `5` for 5x) or `undefined`
 * if no Ethena partner incentive is active for the aToken's underlying
 * reserve.
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
    (i) => i.__typename === 'SupplyPointsIncentive' && i.program.name === 'Ethena Rewards'
  );
  if (!ethena || ethena.__typename !== 'SupplyPointsIncentive') return undefined;

  return Number.isFinite(ethena.multiplier) ? ethena.multiplier : undefined;
};
