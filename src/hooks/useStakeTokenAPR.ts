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

  // Find the MeritSupplyIncentive for `ethereum-sgho`. Its `extraSupplyApr`
  // is the live APR pulled from the merit cron cache; mirrors the legacy
  // `actionsAPR[ETHEREUM_SGHO]` read.
  const merit = query.data.find((i) => {
    const withActionKey = i as unknown as { actionKey?: string | null };
    return (
      i.__typename === 'MeritSupplyIncentive' &&
      withActionKey.actionKey === ETHEREUM_SGHO_ACTION
    );
  });

  if (!merit || merit.__typename !== 'MeritSupplyIncentive') {
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
