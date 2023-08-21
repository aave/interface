import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import BigNumber from 'bignumber.js';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';

enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

interface WithdrawErrorProps {
  assetsBlockingWithdraw: string[];
  poolReserve: ComputedReserveData;
  healthFactorAfterWithdraw: BigNumber;
  withdrawAmount: string;
}
export const useWithdrawError = ({
  assetsBlockingWithdraw,
  poolReserve,
  healthFactorAfterWithdraw,
  withdrawAmount,
}: WithdrawErrorProps) => {
  const { mainTxState: withdrawTxState } = useModalContext();
  const { user } = useAppDataContext();

  let blockingError: ErrorType | undefined = undefined;
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);

  if (!withdrawTxState.success && !withdrawTxState.txHash) {
    if (assetsBlockingWithdraw.length > 0 && !assetsBlockingWithdraw.includes(poolReserve.symbol)) {
      blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED;
    } else if (
      healthFactorAfterWithdraw.lt('1') &&
      user.totalBorrowsMarketReferenceCurrency !== '0'
    ) {
      blockingError = ErrorType.CAN_NOT_WITHDRAW_THIS_AMOUNT;
    } else if (
      !blockingError &&
      (unborrowedLiquidity.eq('0') ||
        valueToBigNumber(withdrawAmount).gt(poolReserve.unborrowedLiquidity))
    ) {
      blockingError = ErrorType.POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY;
    }
  }

  const errors = {
    [ErrorType.CAN_NOT_WITHDRAW_THIS_AMOUNT]: (
      <Trans>You can not withdraw this amount because it will cause collateral call</Trans>
    ),
    [ErrorType.POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY]: (
      <Trans>
        These funds have been borrowed and are not available for withdrawal at this time.
      </Trans>
    ),
    [ErrorType.ZERO_LTV_WITHDRAW_BLOCKED]: (
      <Trans>
        Assets with zero LTV ({assetsBlockingWithdraw}) must be withdrawn or disabled as collateral
        to perform this action
      </Trans>
    ),
  };

  return {
    blockingError,
    errorComponent: blockingError ? errors[blockingError] : null,
  };
};
