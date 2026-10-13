import {
  addedCollateralUsdForLeverage,
  leverageAfterAdding,
  maxAddedCollateralUsdForHealthFactor,
  netApyOfAddedExposure,
  positionLeverage,
} from '../leverage.helpers';

describe('positionLeverage', () => {
  it('is collateral over equity', () => {
    expect(positionLeverage('1000', '0')?.toNumber()).toBe(1);
    expect(positionLeverage('1000', '500')?.toNumber()).toBe(2);
    expect(positionLeverage('1000', '750')?.toNumber()).toBe(4);
  });

  it('is undefined without positive equity', () => {
    expect(positionLeverage('0', '0')).toBeUndefined();
    expect(positionLeverage('1000', '1000')).toBeUndefined();
    expect(positionLeverage('1000', '1200')).toBeUndefined();
  });
});

describe('leverageAfterAdding', () => {
  it('adds equal collateral and debt without touching equity', () => {
    const after = leverageAfterAdding({
      collateralUSD: '1000',
      debtUSD: '500',
      addedCollateralUSD: '500',
      addedDebtUSD: '500',
    });
    expect(after?.toNumber()).toBe(3);
  });
});

describe('addedCollateralUsdForLeverage', () => {
  const position = { collateralUSD: '1000', debtUSD: '500' };

  it('solves target = (C + t) / equity for t', () => {
    const added = addedCollateralUsdForLeverage({ ...position, target: 3 });
    expect(added?.toNumber()).toBe(500);
    expect(
      leverageAfterAdding({
        ...position,
        addedCollateralUSD: added!.toString(),
        addedDebtUSD: added!.toString(),
      })?.toNumber()
    ).toBe(3);
  });

  it('is undefined at or below the current leverage', () => {
    expect(addedCollateralUsdForLeverage({ ...position, target: 2 })).toBeUndefined();
    expect(addedCollateralUsdForLeverage({ ...position, target: 1.5 })).toBeUndefined();
  });

  it('is undefined without equity', () => {
    expect(
      addedCollateralUsdForLeverage({ collateralUSD: '1000', debtUSD: '1000', target: 3 })
    ).toBeUndefined();
    expect(
      addedCollateralUsdForLeverage({ collateralUSD: '0', debtUSD: '0', target: 3 })
    ).toBeUndefined();
  });
});

describe('maxAddedCollateralUsdForHealthFactor', () => {
  const base = {
    collateralUSD: '1000',
    debtUSD: '500',
    currentLiquidationThreshold: '0.8',
    collateralLiquidationThreshold: '0.8',
    targetHealthFactor: 1.05,
  };

  it('lands exactly on the target health factor', () => {
    const added = maxAddedCollateralUsdForHealthFactor(base);
    expect(added?.toNumber()).toBeCloseTo(1100, 6);

    const hfAfter = (0.8 * 1000 + 0.8 * 1100) / (500 + 1100);
    expect(hfAfter).toBeCloseTo(1.05, 6);
  });

  it('is undefined when the bought asset threshold is at or above the target', () => {
    expect(
      maxAddedCollateralUsdForHealthFactor({ ...base, collateralLiquidationThreshold: '1.05' })
    ).toBeUndefined();
    expect(
      maxAddedCollateralUsdForHealthFactor({ ...base, collateralLiquidationThreshold: '1.1' })
    ).toBeUndefined();
  });

  it('is undefined when the position is already below the target', () => {
    expect(maxAddedCollateralUsdForHealthFactor({ ...base, debtUSD: '900' })).toBeUndefined();
  });
});

describe('netApyOfAddedExposure', () => {
  it('nets borrow cost against supply yield over the collateral acquired', () => {
    expect(
      netApyOfAddedExposure({
        collateralUSD: '1000',
        supplyApy: '0.05',
        debtUSD: '1000',
        borrowApy: '0.03',
      })?.toNumber()
    ).toBeCloseTo(0.02, 12);
  });

  it('weights by the amounts on each side', () => {
    expect(
      netApyOfAddedExposure({
        collateralUSD: '1000',
        supplyApy: '0.05',
        debtUSD: '900',
        borrowApy: '0.05',
      })?.toNumber()
    ).toBeCloseTo(0.005, 12);
  });

  it('is undefined without collateral', () => {
    expect(
      netApyOfAddedExposure({
        collateralUSD: '0',
        supplyApy: '0.05',
        debtUSD: '0',
        borrowApy: '0.03',
      })
    ).toBeUndefined();
  });
});
