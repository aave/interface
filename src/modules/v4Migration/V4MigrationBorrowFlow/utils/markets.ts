import { SparklineDatum } from 'src/components/charts/SparklineChart';

import { MigrationOpportunity } from '../../hooks/useMigrationApi';
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
}

/**
 * The V4 markets that list every asset of a borrow position: the API's pick first, then by net APY. The API
 * returns each market's name, APY, health factor and eligibility; the 7-day figures are mocked
 * for now, and the hub and curator are not returned at all.
 */
export const toBorrowMarkets = (opportunity: MigrationOpportunity): BorrowMarket[] =>
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
      };
    })
    .sort((a, b) => Number(b.best) - Number(a.best) || b.apy - a.apy);
