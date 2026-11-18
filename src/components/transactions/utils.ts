import { BigNumberValue, valueToBigNumber } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { CollateralType } from 'src/helpers/types';
import { ComputedUserReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export enum ErrorType {
  SUPPLY_CAP_REACHED,
  NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH,
  ZERO_LTV_WITHDRAW_BLOCKED,
  FLASH_LOAN_NOT_AVAILABLE,
}

/// use flashloan if health factor is less than 1.05 when subtracting the HF effect of the from amount
export const useFlashloan = (healthFactor: string, hfEffectOfFromAmount: string) => {
  return (
    healthFactor !== '-1' &&
    new BigNumber(healthFactor).minus(new BigNumber(hfEffectOfFromAmount)).lt('1.05')
  );
};

export const APPROVAL_GAS_LIMIT = 65000;
export const APPROVE_DELEGATION_GAS_LIMIT = 55000;

/**
 * Safety margin added to the debt when repaying the full balance. Debt accrues between
 * reading it and the transaction landing, so the allowance has to cover a little more
 * than the figure we last read.
 */
export const REPAY_ALL_BUFFER = '1.0025';

/**
 * Additional margin applied on top of `REPAY_ALL_BUFFER` when building the approval
 * itself. `checkRequiresApproval` compares the allowance against a target derived from
 * live debt, so that target creeps upward while the approval is in flight; approving
 * exactly what the gate asked for would leave the user re-approving forever.
 */
export const REPAY_ALL_APPROVAL_MARGIN = '1.0025';

/** The amount the approval gate demands before a full repay is allowed to proceed. */
export const getSafeAmountToRepayAll = (debt: BigNumberValue, decimals: number): BigNumber =>
  valueToBigNumber(debt).multipliedBy(REPAY_ALL_BUFFER).decimalPlaces(decimals, BigNumber.ROUND_UP);

/**
 * The amount to put in an `approve` call for a repay, given whatever
 * `checkRequiresApproval` is being asked to accept.
 *
 * Must never come out below that figure, or the approval succeeds and the gate rejects it
 * on the next render, trapping the user in an approve loop.
 */
export const getRepayAmountToApprove = ({
  amountRequiringApproval,
  isMaxRepay,
  decimals,
}: {
  amountRequiringApproval: string;
  isMaxRepay: boolean;
  decimals: number;
}): string => {
  // A typed amount is fixed, so the gate's target cannot drift away from it. A full repay
  // is derived from live debt and does drift, hence the margin.
  const amount = isMaxRepay
    ? valueToBigNumber(amountRequiringApproval).multipliedBy(REPAY_ALL_APPROVAL_MARGIN)
    : valueToBigNumber(amountRequiringApproval);

  // The repay input accepts more decimals than the token has, and this result is handed to
  // `parseUnits` during render, which throws on the excess. Rounding up rather than down
  // keeps the approval at or above what the gate asked for.
  return amount.decimalPlaces(decimals, BigNumber.ROUND_UP).toString(10);
};

export const checkRequiresApproval = ({
  approvedAmount,
  signedAmount,
  amount,
}: {
  approvedAmount: string;
  signedAmount: string;
  amount: string;
}) => {
  // Returns false if the user has a max approval, an approval > amountToSupply, or a valid signature for amountToSupply
  if (
    approvedAmount === '-1' ||
    signedAmount === '-1' ||
    (approvedAmount !== '0' && Number(approvedAmount) >= Number(amount)) ||
    Number(signedAmount) >= Number(amount)
  ) {
    return false;
  } else {
    return true;
  }
};

export const getAssetCollateralType = (
  userReserve: ComputedUserReserveData,
  userTotalCollateralUSD: string,
  userIsInIsolationMode: boolean,
  debtCeilingIsMaxed: boolean
) => {
  const poolReserve = userReserve.reserve;

  if (!poolReserve.usageAsCollateralEnabled) {
    return CollateralType.UNAVAILABLE;
  }

  let collateralType: CollateralType = CollateralType.ENABLED;
  const userHasSuppliedReserve = userReserve && userReserve.scaledATokenBalance !== '0';
  const userHasCollateral = userTotalCollateralUSD !== '0';

  if (poolReserve.isIsolated) {
    if (debtCeilingIsMaxed) {
      collateralType = CollateralType.UNAVAILABLE;
    } else if (userIsInIsolationMode) {
      if (userHasSuppliedReserve) {
        collateralType = userReserve.usageAsCollateralEnabledOnUser
          ? CollateralType.ISOLATED_ENABLED
          : CollateralType.DISABLED;
      } else {
        if (userHasCollateral) {
          collateralType = CollateralType.UNAVAILABLE_DUE_TO_ISOLATION;
        }
      }
    } else {
      if (userHasCollateral) {
        collateralType = CollateralType.ISOLATED_DISABLED;
      } else {
        collateralType = CollateralType.ISOLATED_ENABLED;
      }
    }
  } else {
    if (userIsInIsolationMode) {
      collateralType = CollateralType.UNAVAILABLE_DUE_TO_ISOLATION;
    } else {
      if (userHasSuppliedReserve) {
        collateralType = userReserve.usageAsCollateralEnabledOnUser
          ? CollateralType.ENABLED
          : CollateralType.DISABLED;
      } else {
        collateralType = CollateralType.ENABLED;
      }
    }
  }

  return collateralType;
};
