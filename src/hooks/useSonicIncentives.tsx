/**
 * Sonic partner incentive adapter over the V3 backend.
 *
 * Same shape as `useEthenaIncentives`: legacy signature
 * `useSonicIncentives(rewardedAsset)` where `rewardedAsset` is the aToken
 * address. Resolves aToken → underlying internally via `useAppDataContext`
 * and reads `StaticSupplyIncentive` where `partnerName === "Sonic"`.
 */
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useReserveIncentives } from './useReserveIncentives';

export const useSonicIncentives = (
  rewardedAsset?: string,
): number | undefined => {
  const chainId = useRootStore((s) => s.currentChainId);
  const currentMarket = useRootStore((s) => s.currentMarket);
  const { supplyReserves } = useAppDataContext();

  const reserve = rewardedAsset
    ? supplyReserves.find(
        (r) => r.aToken.address.toLowerCase() === rewardedAsset.toLowerCase(),
      )
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
    (i) =>
      i.__typename === 'StaticSupplyIncentive' && i.partnerName === 'Sonic',
  );
  if (!sonic || sonic.__typename !== 'StaticSupplyIncentive') return undefined;

  const value = parseFloat(sonic.extraApr.formatted);
  return Number.isFinite(value) ? value : undefined;
};
