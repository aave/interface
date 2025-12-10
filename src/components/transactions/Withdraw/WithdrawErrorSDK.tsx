import { valueToBigNumber } from '@aave/math-utils';
import { MarketUserState } from '@aave/react';
import { Trans } from '@lingui/macro';
import { BigNumber } from 'bignumber.js';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';

enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

interface WithdrawErrorPropsSDK {
  assetsBlockingWithdraw: string[];
  poolReserve: ReserveWithId;
  hfPreviewAfter: BigNumber;
  withdrawAmount: string;
  userState: MarketUserState | null | undefined;
}
export const useWithdrawErrorSDK = ({
  assetsBlockingWithdraw,
  poolReserve,
  hfPreviewAfter,
  withdrawAmount,
  userState,
}: WithdrawErrorPropsSDK) => {
  const { mainTxState: withdrawTxState } = useModalContext();

  let blockingError: ErrorType | undefined = undefined;
  const unborrowedLiquidity = valueToBigNumber(
    poolReserve.borrowInfo?.availableLiquidity.amount.value ??
      poolReserve.supplyInfo.total.value ?? // DecimalValue total supply
      '0'
  );

  if (!withdrawTxState.success && !withdrawTxState.txHash) {
    if (
      assetsBlockingWithdraw.length > 0 &&
      !assetsBlockingWithdraw.includes(poolReserve.underlyingToken.address)
    ) {
      blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED;
    } else if (hfPreviewAfter.lt('1') && userState?.totalDebtBase !== '0') {
      blockingError = ErrorType.CAN_NOT_WITHDRAW_THIS_AMOUNT;
    } else if (
      !blockingError &&
      (unborrowedLiquidity.eq('0') ||
        valueToBigNumber(withdrawAmount).gt(unborrowedLiquidity ?? '0'))
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
        Assets with zero LTV ({assetsBlockingWithdraw.join(', ')}) must be withdrawn or disabled as
        collateral to perform this action
      </Trans>
    ),
  };

  return {
    blockingError,
    errorComponent: blockingError ? errors[blockingError] : null,
  };
};
