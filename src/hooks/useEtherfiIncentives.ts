/**
 * EtherFi partner incentive adapter over the V3 backend.
 *
 * Legacy signature: `useEtherfiIncentives(market, symbol, protocolAction)`.
 * Resolves `(market, symbol)` to the underlying asset via
 * `useAppDataContext`, then reads the `SupplyPointsIncentive` whose
 * `program.name === "Ether.fi Loyalty"` from `useReserveIncentives`. EtherFi
 * is a supply-only loyalty multiplier — borrow contexts get `undefined`
 * so `IncentivesCard` doesn't render the badge on borrow rows. Ether.fi
 * pays in loyalty points, not APR — see `EtherFiAirdropTooltipContent`.
 */
import { ProtocolAction } from '@aave/contract-helpers';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useReserveIncentives } from './useReserveIncentives';

export const useEtherfiIncentives = (
  market?: string,
  symbol?: string,
  protocolAction?: ProtocolAction
): number | undefined => {
  const chainId = useRootStore((s) => s.currentChainId);
  const { supplyReserves } = useAppDataContext();

  // IncentivesCard calls this hook for both supply and borrow rows. EtherFi
  // only has a supply incentive, so gate the query on non-borrow to avoid
  // rendering the badge on borrow positions of eligible assets.
  const isSupplyContext = protocolAction !== ProtocolAction.borrow;

  // Resolve (market, symbol) → underlying via the reserves snapshot.
  const reserve = symbol
    ? supplyReserves.find((r) => r.underlyingToken.symbol.toLowerCase() === symbol.toLowerCase())
    : undefined;
  const underlying = reserve?.underlyingToken.address;

  const { data } = useReserveIncentives({
    market: market ?? '',
    underlying: underlying ?? '',
    chainId,
    enabled: Boolean(isSupplyContext && market && underlying && chainId),
  });

  if (!isSupplyContext || !data) return undefined;

  const etherfi = data.find(
    (i) => i.__typename === 'SupplyPointsIncentive' && i.program.name === 'Ether.fi Loyalty'
  );
  if (!etherfi || etherfi.__typename !== 'SupplyPointsIncentive') return undefined;

  return Number.isFinite(etherfi.multiplier) ? etherfi.multiplier : undefined;
};
