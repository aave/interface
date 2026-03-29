import { Trans } from '@lingui/macro';
import { useModalContext } from 'src/hooks/useModal';

export enum RepayErrorType {
  ZERO_LTV_REPAY_BLOCKED,
}

interface RepayErrorProps {
  assetsBlockingWithdraw: string[];
  repayWithATokens: boolean;
}

export const useRepayError = ({ assetsBlockingWithdraw, repayWithATokens }: RepayErrorProps) => {
  const { mainTxState: repayTxState } = useModalContext();

  let blockingError: RepayErrorType | undefined = undefined;

  if (!repayTxState.success && !repayTxState.txHash) {
    if (repayWithATokens && assetsBlockingWithdraw.length > 0) {
      blockingError = RepayErrorType.ZERO_LTV_REPAY_BLOCKED;
    }
  }

  const errors = {
    [RepayErrorType.ZERO_LTV_REPAY_BLOCKED]: (
      <Trans>
        Assets with zero LTV ({assetsBlockingWithdraw.join(', ')}) must be withdrawn or disabled as
        collateral to repay with aTokens. Please repay using your wallet balance instead.
      </Trans>
    ),
  };

  return {
    blockingError,
    errorComponent: blockingError !== undefined ? errors[blockingError] : null,
  };
};
