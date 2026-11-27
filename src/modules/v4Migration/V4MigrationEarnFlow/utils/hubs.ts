import { MigrationOpportunity } from '@aave/react';

import { findV4Reserve, V4SupplyReserve } from '../../hooks/useV4Reserves';
import { listsPosition } from '../../V4MigrationPage/utils/opportunities';

export interface EarnHub {
  /** The address of the V4 spoke the position moves through. */
  id: string;
  /** The hub's name; the spoke's when the V4 API could not tell which hub it belongs to. */
  name: string;
  apy: number;
  bestApy: boolean;
  unavailable: boolean;
  /** Whether the spoke takes the asset as collateral. False when the V4 API could not tell. */
  canUseAsCollateral: boolean;
  /** The V4 reserve the position lands in, with the hub behind it. Missing as `name` says. */
  reserve?: V4SupplyReserve;
}

/**
 * The V4 hubs an earn position can move to, highest APY first. The migration API returns one
 * target per spoke, and several spokes can lead to the same hub at the same APY, so a hub is shown
 * once: through the first of its spokes in the API's order, which puts eligible spokes first.
 *
 * TODO: product has to say which spoke a hub is entered through; between spokes that tie, the API's
 * order is by address. `reserves`, from the V4 API, say which hub a spoke belongs to; without them
 * every spoke is listed on its own.
 */
export const toEarnHubs = (
  opportunity: MigrationOpportunity,
  reserves?: V4SupplyReserve[]
): EarnHub[] => {
  const best = opportunity.bestTarget?.spoke.address;
  const hubs = new Map<string, EarnHub>();

  for (const target of opportunity.targets.filter(listsPosition)) {
    const reserve = findV4Reserve(reserves, target.spoke.address);
    const key = reserve?.hubId ?? target.spoke.address;
    const bestApy = target.spoke.address === best;
    const shown = hubs.get(key);

    if (shown) {
      shown.bestApy ||= bestApy;
      continue;
    }
    hubs.set(key, {
      id: target.spoke.address,
      name: reserve?.hubName ?? target.spoke.name,
      apy: Number(target.apy?.value ?? 0),
      bestApy,
      unavailable: !target.eligible,
      // As collateral the position lands in the spoke's lowest reserve that takes it as such, which
      // need not be `reserve`.
      canUseAsCollateral: !!reserves?.some(
        (candidate) =>
          candidate.canUseAsCollateral &&
          candidate.spokeAddress.toLowerCase() === target.spoke.address.toLowerCase()
      ),
      reserve,
    });
  }

  return Array.from(hubs.values()).sort((a, b) => b.apy - a.apy);
};
