import { valueToBigNumber } from '@aave/math-utils';

/**
 * Leverage is collateral over equity. Undefined when there is no equity to lever: the flash loan
 * adds collateral and debt in equal measure, so a position with none cannot support any.
 */
export const positionLeverage = (collateralUSD: string, debtUSD: string) => {
  const collateral = valueToBigNumber(collateralUSD);
  const equity = collateral.minus(valueToBigNumber(debtUSD));
  if (collateral.lte(0) || equity.lte(0)) return undefined;
  return collateral.div(equity);
};

export const leverageAfterAdding = ({
  collateralUSD,
  debtUSD,
  addedCollateralUSD,
  addedDebtUSD,
}: {
  collateralUSD: string;
  debtUSD: string;
  addedCollateralUSD: string;
  addedDebtUSD: string;
}) =>
  positionLeverage(
    valueToBigNumber(collateralUSD).plus(valueToBigNumber(addedCollateralUSD)).toString(),
    valueToBigNumber(debtUSD).plus(valueToBigNumber(addedDebtUSD)).toString()
  );

/**
 * Buying `t` USD of collateral with `t` USD of new debt leaves equity untouched, so the target
 * solves in closed form: target = (C + t) / (C - D)  =>  t = target * equity - C.
 *
 * Returns undefined when the target is at or below the current leverage, which deleveraging
 * would have to reach instead.
 */
export const addedCollateralUsdForLeverage = ({
  collateralUSD,
  debtUSD,
  target,
}: {
  collateralUSD: string;
  debtUSD: string;
  target: number;
}) => {
  const collateral = valueToBigNumber(collateralUSD);
  const equity = collateral.minus(valueToBigNumber(debtUSD));
  if (collateral.lte(0) || equity.lte(0)) return undefined;

  const added = equity.multipliedBy(target).minus(collateral);
  return added.gt(0) ? added : undefined;
};

/**
 * Largest amount that still lands on `targetHealthFactor`, from
 * (LT * C + LTc * t) / (D + t) = H  =>  t = (H * D - LT * C) / (LTc - H).
 *
 * Undefined when the bought asset's liquidation threshold is at or above the target, since the
 * health factor then never falls to it and the ceiling comes from borrow power instead.
 */
export const maxAddedCollateralUsdForHealthFactor = ({
  collateralUSD,
  debtUSD,
  currentLiquidationThreshold,
  collateralLiquidationThreshold,
  targetHealthFactor,
}: {
  collateralUSD: string;
  debtUSD: string;
  currentLiquidationThreshold: string;
  collateralLiquidationThreshold: string;
  targetHealthFactor: number;
}) => {
  const weightedCollateral = valueToBigNumber(collateralUSD).multipliedBy(
    valueToBigNumber(currentLiquidationThreshold)
  );
  const target = valueToBigNumber(targetHealthFactor);
  const denominator = valueToBigNumber(collateralLiquidationThreshold).minus(target);
  if (denominator.gte(0)) return undefined;

  const added = target
    .multipliedBy(valueToBigNumber(debtUSD))
    .minus(weightedCollateral)
    .div(denominator);

  return added.gt(0) ? added : undefined;
};

/**
 * Net rate of the added exposure: what the new collateral earns less what the new debt costs,
 * over the collateral acquired. Weighting by the amounts matters because the swap does not land
 * exactly equal USD on both sides once costs are taken.
 */
export const netApyOfAddedExposure = ({
  collateralUSD,
  supplyApy,
  debtUSD,
  borrowApy,
}: {
  collateralUSD: string;
  supplyApy: string;
  debtUSD: string;
  borrowApy: string;
}) => {
  const collateral = valueToBigNumber(collateralUSD);
  if (collateral.lte(0)) return undefined;

  return collateral
    .multipliedBy(valueToBigNumber(supplyApy))
    .minus(valueToBigNumber(debtUSD).multipliedBy(valueToBigNumber(borrowApy)))
    .div(collateral);
};
