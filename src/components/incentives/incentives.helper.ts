import type { AaveBorrowIncentive, AaveSupplyIncentive, ReserveIncentive } from '@aave/graphql';
import type { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';

//Typescript GUARDS
const isAaveSupplyIncentive = (incentive: ReserveIncentive): incentive is AaveSupplyIncentive => {
  return incentive.__typename === 'AaveSupplyIncentive';
};

const isAaveBorrowIncentive = (incentive: ReserveIncentive): incentive is AaveBorrowIncentive => {
  return incentive.__typename === 'AaveBorrowIncentive';
};

export const isAaveProtocolIncentive = (incentive: ReserveIncentive): boolean => {
  return isAaveSupplyIncentive(incentive) || isAaveBorrowIncentive(incentive);
};

export const getIncentiveAPR = (incentive: ReserveIncentive): string => {
  // For AaveSupplyIncentive
  if (isAaveSupplyIncentive(incentive) && incentive.extraSupplyApr?.value) {
    return incentive.extraSupplyApr.value.toString();
  }

  // For AaveBorrowIncentive
  if (isAaveBorrowIncentive(incentive) && incentive.borrowAprDiscount?.value) {
    return incentive.borrowAprDiscount.value.toString();
  }

  // Fallback for previous structure)
  if ('incentiveAPR' in incentive) {
    return String(incentive.incentiveAPR);
  }

  return '0';
};

// Mapping sdk structure to legacy structure used in incentives card logic
export const mapAaveProtocolIncentives = (
  incentives: ReserveIncentive[] | undefined,
  direction: 'supply' | 'borrow'
): ReserveIncentiveResponse[] => {
  if (!incentives || incentives.length === 0) {
    return [];
  }

  const typedIncentives =
    direction === 'supply'
      ? incentives.filter(isAaveSupplyIncentive)
      : incentives.filter(isAaveBorrowIncentive);

  return typedIncentives.map((incentive) => ({
    incentiveAPR: getIncentiveAPR(incentive),
    rewardTokenAddress: incentive.rewardTokenAddress,
    rewardTokenSymbol: incentive.rewardTokenSymbol,
  }));
};
