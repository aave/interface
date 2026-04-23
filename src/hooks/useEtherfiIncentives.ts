/**
 * EtherFi partner incentive adapter over the V3 backend.
 *
 * Legacy signature: `useEtherfiIncentives(market, symbol, protocolAction)`.
 * Resolves `(market, symbol)` to the underlying asset via
 * `useAppDataContext`, then reads `StaticSupplyIncentive` where
 * `partnerName === "EtherFi"` from `useReserveIncentives`. `protocolAction`
 * is kept in the signature for compat but no longer affects the lookup —
 * EtherFi is always supply-side.
 */
import { ProtocolAction } from '@aave/contract-helpers';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useReserveIncentives } from './useReserveIncentives';

export const useEtherfiIncentives = (
  market?: string,
  symbol?: string,
  _protocolAction?: ProtocolAction,
): number | undefined => {
  const chainId = useRootStore((s) => s.currentChainId);
  const { supplyReserves } = useAppDataContext();

  // Resolve (market, symbol) → underlying via the reserves snapshot.
  const reserve = symbol
    ? supplyReserves.find(
        (r) => r.underlyingToken.symbol.toLowerCase() === symbol.toLowerCase(),
      )
    : undefined;
  const underlying = reserve?.underlyingToken.address;

  const { data } = useReserveIncentives({
    market: market ?? '',
    underlying: underlying ?? '',
    chainId,
    enabled: Boolean(market && underlying && chainId),
  });

  if (!data) return undefined;

  const etherfi = data.find(
    (i) =>
      i.__typename === 'StaticSupplyIncentive' && i.partnerName === 'EtherFi',
  );
  if (!etherfi || etherfi.__typename !== 'StaticSupplyIncentive') return undefined;

  const value = parseFloat(etherfi.extraApr.formatted);
  return Number.isFinite(value) ? value : undefined;
};
