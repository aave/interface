/**
 * sGHO staking APR adapter over the V3 backend.
 *
 * The sGHO display APR is the same number Merit pays users who supply GHO on
 * Aave V3 Ethereum (action `ethereum-sgho`). Previously this hook fetched
 * `apps.aavechan.com/api/merit/aprs` directly; now it reads the MERIT
 * incentive off `useReserveIncentives` for the GHO reserve on mainnet.
 *
 * Hardcoded addresses (mainnet GHO reserve) are intentional: this hook
 * specifically drives the sGHO staking UI, not a generic reserve.
 */
import { AaveV3Ethereum } from '@aave-dao/aave-address-book';

import { useReserveIncentives } from './useReserveIncentives';

const MAINNET_V3_MARKET = AaveV3Ethereum.POOL_ADDRESSES_PROVIDER;
const GHO_UNDERLYING = AaveV3Ethereum.ASSETS.GHO.UNDERLYING;
const MAINNET_CHAIN_ID = 1;
const ETHEREUM_SGHO_ACTION = 'ethereum-sgho';

export const useStakeTokenAPR = () => {
  const query = useReserveIncentives({
    market: MAINNET_V3_MARKET,
    underlying: GHO_UNDERLYING,
    chainId: MAINNET_CHAIN_ID,
  });

  if (!query.data) {
    return { ...query, data: null as { apr: string; aprPercentage: number } | null };
  }

  // Prefer the MeritSupplyIncentive tagged with `ethereum-sgho` — matches
  // the legacy `actionsAPR[ETHEREUM_SGHO]` read. Fall back to any GHO Merit
  // supply incentive so this hook keeps returning a non-null APR on backend
  // deployments that don't yet expose `actionKey` (there's only ever one
  // Merit supply campaign on GHO mainnet). The field is read via cast until
  // the backend-side query schema ships the enrichment.
  const supplyMerits = query.data.filter(
    (i): i is Extract<typeof i, { __typename: 'MeritSupplyIncentive' }> =>
      i.__typename === 'MeritSupplyIncentive'
  );
  const merit =
    supplyMerits.find(
      (i) => (i as unknown as { actionKey?: string | null }).actionKey === ETHEREUM_SGHO_ACTION
    ) ?? supplyMerits[0];

  if (!merit) {
    return { ...query, data: null };
  }

  const stakeAPR = parseFloat(merit.extraSupplyApr.formatted);
  if (!Number.isFinite(stakeAPR) || stakeAPR <= 0) {
    return { ...query, data: null };
  }

  return {
    ...query,
    data: {
      apr: (stakeAPR / 100).toString(),
      aprPercentage: stakeAPR,
    },
  };
};
