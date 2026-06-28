import {
  LIQUIDATION_DANGER_THRESHOLD,
  LIQUIDATION_SAFETY_THRESHOLD,
} from '../constants/shared.constants';

export const valueLostPercentage = (destValueInUsd: number, srcValueInUsd: number) => {
  if (destValueInUsd === 0) return 1;
  if (srcValueInUsd === 0) return 0;

  const receivingPercentage = destValueInUsd / srcValueInUsd;
  const valueLostPercentage = receivingPercentage ? 1 - receivingPercentage : 0;
  return valueLostPercentage;
};

export const shouldShowWarning = (lostValue: number, srcValueInUsd: number) => {
  if (srcValueInUsd > 500000) return lostValue > 0.03;
  if (srcValueInUsd > 100000) return lostValue > 0.04;
  if (srcValueInUsd > 10000) return lostValue > 0.05;
  if (srcValueInUsd > 1000) return lostValue > 0.07;

  return lostValue > 0.05;
};

export const shouldRequireConfirmation = (lostValue: number) => {
  return lostValue > 0.2;
};

export const shouldRequireConfirmationHFlow = (healthFactor: number) => {
  return (
    healthFactor < LIQUIDATION_SAFETY_THRESHOLD && healthFactor >= LIQUIDATION_DANGER_THRESHOLD
  );
};
