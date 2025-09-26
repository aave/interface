import type { AaveBorrowIncentive, AaveSupplyIncentive, ReserveIncentive } from '@aave/graphql';
import type { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';

const isAaveSupplyIncentive = (incentive: ReserveIncentive): incentive is AaveSupplyIncentive => {
  return incentive.__typename === 'AaveSupplyIncentive';
};

const isAaveBorrowIncentive = (incentive: ReserveIncentive): incentive is AaveBorrowIncentive => {
  return incentive.__typename === 'AaveBorrowIncentive';
};

// Guard combinado para incentivos de protocolo Aave
export const isAaveProtocolIncentive = (incentive: ReserveIncentive): boolean => {
  return isAaveSupplyIncentive(incentive) || isAaveBorrowIncentive(incentive);
};

export const getIncentiveAPR = (incentive: ReserveIncentive): string => {
  // Para AaveSupplyIncentive
  if ('extraSupplyApr' in incentive && incentive.extraSupplyApr?.value) {
    return incentive.extraSupplyApr.value.toString();
  }

  // Para AaveBorrowIncentive
  if ('borrowAprDiscount' in incentive && incentive.borrowAprDiscount?.value) {
    return incentive.borrowAprDiscount.value.toString();
  }

  // Fallback para estructura anterior (por compatibilidad)
  if ('incentiveAPR' in incentive) {
    return String(incentive.incentiveAPR);
  }

  return '0';
};

export const calculateProtocolIncentivesAPR = (
  incentives: ReserveIncentive[] | undefined
): number | 'Infinity' => {
  return (
    incentives?.filter(isAaveProtocolIncentive)?.reduce((sum, inc) => {
      const aprString = getIncentiveAPR(inc);

      if (aprString === 'Infinity' || sum === 'Infinity') {
        return 'Infinity';
      }

      const aprValue = parseFloat(aprString);

      if (aprValue === Infinity || Number.isNaN(aprValue)) {
        return sum;
      }

      return sum + aprValue;
    }, 0 as number | 'Infinity') || 0
  );
};

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
