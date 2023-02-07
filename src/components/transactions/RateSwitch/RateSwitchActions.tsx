import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type RateSwitchActionsProps = {
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  currentRateMode: InterestRate;
  blocked: boolean;
};

export const RateSwitchActions = ({
  poolReserve,
  isWrongNetwork,
  currentRateMode,
  blocked,
}: RateSwitchActionsProps) => {
  const swapBorrowRateMode = useRootStore((state) => state.swapBorrowRateMode);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return await swapBorrowRateMode({
        reserve: poolReserve.underlyingAsset,
        interestRateMode: currentRateMode,
      });
    },
    skip: blocked,
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      actionText={<Trans>Switch rate</Trans>}
      actionInProgressText={<Trans>Switching rate</Trans>}
      handleAction={action}
    />
  );
};
