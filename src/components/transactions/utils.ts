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

export const APPROVAL_GAS_LIMIT = 65000;

export const checkRequiresApproval = ({
  approvedAmount,
  signedAmount,
  amountToSupply,
}: {
  approvedAmount: string;
  signedAmount: string;
  amountToSupply: string;
}) => {
  // Returns false if the user has a max approval, an approval > amountToSupply, or a valid signature for amountToSupply
  if (
    approvedAmount === '-1' ||
    (approvedAmount !== '0' && Number(approvedAmount) >= Number(amountToSupply)) ||
    Number(signedAmount) >= Number(amountToSupply)
  ) {
    return false;
  } else {
    return true;
  }
};
