import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type CollateralChangeActionsProps = {
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  usageAsCollateral: boolean;
  blocked: boolean;
  symbol: string;
};

export const CollateralChangeActions = ({
  poolReserve,
  isWrongNetwork,
  usageAsCollateral,
  blocked,
  symbol,
}: CollateralChangeActionsProps) => {
  const setUsageAsCollateral = useRootStore((state) => state.setUsageAsCollateral);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return setUsageAsCollateral({
        reserve: poolReserve.underlyingAsset,
        usageAsCollateral,
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
      actionText={
        usageAsCollateral ? (
          <Trans>Enable {symbol} as collateral</Trans>
        ) : (
          <Trans>Disable {symbol} as collateral</Trans>
        )
      }
      actionInProgressText={<Trans>Pending...</Trans>}
      handleAction={action}
    />
  );
};
