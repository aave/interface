/**
 * Sonic partner incentive adapter over the V3 backend.
 *
 * Same shape as `useEthenaIncentives`: legacy signature
 * `useSonicIncentives(rewardedAsset)` where `rewardedAsset` is the aToken
 * address. Resolves aToken → underlying internally via `useAppDataContext`
 * and reads the `SupplyPointsIncentive` whose `program.name === "Sonic"`.
 * Currently the V3 backend ships no Sonic POINTS program (the legacy
 * `SONIC_DATA_MAP` was empty), so this hook returns `undefined` until BD
 * adds one through the Slack admin path.
 */
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useReserveIncentives } from './useReserveIncentives';

export const useSonicIncentives = (rewardedAsset?: string): number | undefined => {
  const chainId = useRootStore((s) => s.currentChainId);
  const currentMarket = useRootStore((s) => s.currentMarket);
  const { supplyReserves } = useAppDataContext();

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

  const sonic = data.find(
    (i) => i.__typename === 'SupplyPointsIncentive' && i.program.name === 'Sonic'
  );
  if (!sonic || sonic.__typename !== 'SupplyPointsIncentive') return undefined;

  return Number.isFinite(sonic.multiplier) ? sonic.multiplier : undefined;
};
