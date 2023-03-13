import { BigNumber } from 'bignumber.js';
import { ExtendedFormattedUser } from 'src/hooks/app-data-provider/useAppDataProvider';

export enum ErrorType {
  SUPPLY_CAP_REACHED,
  HF_BELOW_ONE,
  NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const useFlashloan = (healthFactor: string, hfEffectOfFromAmount: string) => {
  return (
    healthFactor !== '-1' &&
    new BigNumber(healthFactor).minus(new BigNumber(hfEffectOfFromAmount)).lt('1.05')
  );
};

export const zeroLTVBlockingWithdraw = (user: ExtendedFormattedUser): string[] => {
  const zeroLTVBlockingWithdraw: string[] = [];
  user.userReservesData.forEach((userReserve) => {
    if (
      Number(userReserve.scaledATokenBalance) > 0 &&
      userReserve.reserve.baseLTVasCollateral === '0' &&
      userReserve.usageAsCollateralEnabledOnUser &&
      userReserve.reserve.reserveLiquidationThreshold !== '0'
    ) {
      zeroLTVBlockingWithdraw.push(userReserve.reserve.symbol);
    }
  });
  return zeroLTVBlockingWithdraw;
};
