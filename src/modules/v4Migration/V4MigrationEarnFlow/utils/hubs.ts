import { MigrationOpportunity } from '@aave/react';
import { SparklineDatum } from 'src/components/charts/SparklineChart';

import { MigrationAsset } from '../../V4MigrationPage/utils/types';
import {
  average,
  MOCK_BACKING_COLLATERAL,
  MOCK_HAS_INCENTIVES,
  MOCK_TOTAL_DEPOSITS_USD,
  mockApyHistory,
} from './mocks';

export interface EarnHub {
  /** The V4 spoke's address. */
  id: string;
  name: string;
  apy: number;
  bestApy: boolean;
  unavailable: boolean;
  apyAverage: number;
  apyHistory: SparklineDatum[];
  hasIncentives: boolean;
  totalDepositsUSD: number;
  backingCollateral: MigrationAsset[];
}

/**
 * The V4 hubs an earn position could move to, highest APY first. The API returns each hub's name,
 * APY and eligibility; the rest of the card is mocked for now (see `./mocks`).
 */
export const toEarnHubs = (opportunity: MigrationOpportunity): EarnHub[] =>
  opportunity.targets
    .map((target, index) => {
      const apy = Number(target.apy?.value ?? 0);
      const apyHistory = mockApyHistory(apy, index + 1);

      return {
        id: target.spoke.address,
        name: target.spoke.name,
        apy,
        bestApy: target.spoke.address === opportunity.bestTarget?.spoke.address,
        unavailable: !target.eligible,
        apyAverage: average(apyHistory),
        apyHistory,
        hasIncentives: MOCK_HAS_INCENTIVES,
        totalDepositsUSD: MOCK_TOTAL_DEPOSITS_USD,
        backingCollateral: MOCK_BACKING_COLLATERAL,
      };
    })
    .sort((a, b) => b.apy - a.apy);
