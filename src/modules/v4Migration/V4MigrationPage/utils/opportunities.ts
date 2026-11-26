import { MigrationOpportunity } from '@aave/react';

import { getMigrationMarketTitle } from './markets';
import { BorrowMigrationPosition, EarnMigrationPosition, MigrationAsset, Variation } from './types';

type Currency = MigrationOpportunity['supplies'][number]['currency'];

const toAsset = ({ symbol, name, address }: Currency): MigrationAsset => ({
  symbol,
  name,
  address,
});

/** A before/after pair, or nothing when the position has no value today to compare from. */
const toVariation = <T>(
  current: string | null | undefined,
  after: string | null | undefined,
  convert: (value: string) => T
): Variation<T> | undefined => {
  if (current === null || current === undefined) return undefined;
  return {
    current: convert(current),
    after: after === null || after === undefined ? undefined : convert(after),
  };
};

const toNumber = (value: string | null) => (value === null ? undefined : Number(value));

const positionId = (opportunity: MigrationOpportunity, suffix?: string) =>
  [opportunity.market.chain.chainId, opportunity.market.address.toLowerCase(), suffix]
    .filter(Boolean)
    .join(':');

/** Reads a position id back into the V3 market, and for an earn position the supplied asset. */
export const parsePositionId = (id: string) => {
  const [chainId, market, asset] = id.split(':');
  if (!Number(chainId) || !market) return undefined;
  return { chainId: Number(chainId), market, asset };
};

type Target = MigrationOpportunity['targets'][number];

/**
 * Whether the V4 spoke lists every asset of the position, in the role the position holds it. The
 * API returns a target for every spoke on the chain; the ones that fail this have nothing to do
 * with the position, so they are not worth showing even as unavailable.
 */
export const listsPosition = (target: Target) =>
  !target.criteria.some((result) => result.criterion === 'ASSET_SUPPORTED' && !result.met);

/** The earn opportunity a row of the earn table was built from. */
export const findEarnOpportunity = (opportunities: MigrationOpportunity[], id: string) =>
  opportunities.find((opportunity) => {
    const supply = opportunity.supplies[0];
    return (
      opportunity.kind === 'EARN' &&
      !!supply &&
      positionId(opportunity, supply.currency.address.toLowerCase()) === id
    );
  });

/** The borrow opportunity a row of the borrow table was built from: one per V3 market. */
export const findBorrowOpportunity = (opportunities: MigrationOpportunity[], id: string) =>
  opportunities.find(
    (opportunity) => opportunity.kind === 'BORROW' && positionId(opportunity) === id
  );

const toEarnPosition = (opportunity: MigrationOpportunity): EarnMigrationPosition | undefined => {
  const supply = opportunity.supplies[0];
  if (!supply) return undefined;
  const target = opportunity.bestTarget;

  return {
    id: positionId(opportunity, supply.currency.address.toLowerCase()),
    canMigrate: !!target,
    asset: toAsset(supply.currency),
    marketName: getMigrationMarketTitle(opportunity.market),
    supplied: { amount: supply.amount.amount.value, usd: supply.amount.usd },
    supplyApy: toVariation(opportunity.apy?.value, target?.apy?.value, Number),
    projectedEarningsUSD: toVariation(
      opportunity.yearlyEarningsUsd,
      target?.yearlyEarningsUsd,
      Number
    ),
  };
};

const toBorrowPosition = (opportunity: MigrationOpportunity): BorrowMigrationPosition => {
  const target = opportunity.bestTarget;

  return {
    id: positionId(opportunity),
    canMigrate: !!target,
    chainId: opportunity.market.chain.chainId,
    marketName: getMigrationMarketTitle(opportunity.market),
    netBalanceUSD: toNumber(opportunity.netBalanceUsd),
    collateral: opportunity.supplies.map((supply) => toAsset(supply.currency)),
    collateralUSD: toNumber(opportunity.suppliedUsd) ?? 0,
    borrowed: opportunity.debts.map((debt) => toAsset(debt.currency)),
    borrowedUSD: toNumber(opportunity.borrowedUsd) ?? 0,
    borrowApy: toVariation(opportunity.borrowApy?.value, target?.borrowApy?.value, Number),
    healthFactor: toVariation(opportunity.healthFactor, target?.healthFactor, String),
  };
};

/**
 * Splits the API's migration opportunities into the page's two tables. The "after" side of every
 * figure is the best eligible V4 spoke's; a position with none keeps only today's values.
 */
export const toMigrationPositions = (opportunities: MigrationOpportunity[]) => ({
  earnPositions: opportunities
    .filter((opportunity) => opportunity.kind === 'EARN')
    .map(toEarnPosition)
    .filter((position): position is EarnMigrationPosition => !!position),
  borrowPositions: opportunities
    .filter((opportunity) => opportunity.kind === 'BORROW')
    .map(toBorrowPosition),
});
