import { SparklineDatum } from 'src/components/charts/SparklineChart';

import { MigrationOpportunity } from '../../hooks/useMigrationApi';
import { findV4Reserve, V4SupplyReserve } from '../../hooks/useV4Reserves';
import { average, mockApyHistory } from '../../V4MigrationEarnFlow/utils/mocks';
import { listsPosition } from '../../V4MigrationPage/utils/opportunities';

export interface BorrowMarket {
  /** The V4 spoke's address. */
  id: string;
  name: string;
  /** The whole position's net APY once moved. Zero when the API ran no plan for the market. */
  apy: number;
  /** Missing when the API ran no plan for the market. */
  healthFactor?: string;
  /** The API's pick among the eligible markets. */
  best: boolean;
  unavailable: boolean;
  apyAverage: number;
  apyHistory: SparklineDatum[];
  /** The hubs the position's assets sit in on this market. Empty when the V4 API did not answer. */
  hubs: BorrowMarketHub[];
}

export interface BorrowMarketHub {
  id: string;
  name: string;
  curator?: { name: string; icon: string };
}

/** The hubs behind the reserves a position's assets land in on a spoke, its supplies' first. */
const toMarketHubs = (
  opportunity: MigrationOpportunity,
  spokeAddress: string,
  reserves: V4SupplyReserve[] | undefined
) => {
  const hubs = new Map<string, BorrowMarketHub>();
  for (const { currency } of [...opportunity.supplies, ...opportunity.debts]) {
    const reserve = findV4Reserve(reserves, spokeAddress, currency.address);
    if (reserve && !hubs.has(reserve.hubId)) {
      hubs.set(reserve.hubId, {
        id: reserve.hubId,
        name: reserve.hubName,
        curator: reserve.curator,
      });
    }
  }
  return Array.from(hubs.values());
};

/**
 * The V4 markets that list every asset of a borrow position: the API's pick first, then by net APY. The API
 * returns each market's name, APY, health factor and eligibility; the 7-day figures are mocked
 * for now, and the hubs and their curators are read from the V4 API's `reserves`.
 */
export const toBorrowMarkets = (
  opportunity: MigrationOpportunity,
  reserves?: V4SupplyReserve[]
): BorrowMarket[] =>
  opportunity.targets
    .filter(listsPosition)
    .map((target, index) => {
      const apy = Number(target.apy?.value ?? 0);
      const apyHistory = mockApyHistory(apy, index + 1);

      return {
        id: target.spoke.address,
        name: target.spoke.name,
        apy,
        healthFactor: target.healthFactor ?? undefined,
        best: target.spoke.address === opportunity.bestTarget?.spoke.address,
        unavailable: !target.eligible,
        apyAverage: average(apyHistory),
        apyHistory,
        hubs: toMarketHubs(opportunity, target.spoke.address, reserves),
      };
    })
    .sort((a, b) => Number(b.best) - Number(a.best) || b.apy - a.apy);
