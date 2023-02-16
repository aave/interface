import { BigNumber } from 'bignumber.js';

export enum ErrorType {
  SUPPLY_CAP_REACHED,
  HF_BELOW_ONE,
  NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH,
}

export const useFlashloan = (healthFactor: string, hfEffectOfFromAmount: string) => {
  return (
    healthFactor !== '-1' &&
    new BigNumber(healthFactor).minus(new BigNumber(hfEffectOfFromAmount)).lt('1.05')
  );
};
